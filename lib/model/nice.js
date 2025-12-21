import Matrix from '../util/matrix.js'
import NeuralNetwork from './neuralnetwork.js'
import { FlowLayer } from './nns/layer/base.js'
import ReverseLayer from './nns/layer/reverse.js'

/**
 * Flow-based generative model
 * non-linear independent component estimation
 */
export default class NICE {
	// https://qiita.com/shionhonda/items/0fb7f91a150dff604cc5
	// https://deeplearning.jp/flow-based-deep-generative-models/
	/**
	 * @param {number} layer_number Number of layers
	 * @param {string} optimizer Optimizer of the network
	 */
	constructor(layer_number, optimizer) {
		const layers = [{ type: 'input' }]
		for (let i = 0; i < layer_number; i++) {
			layers.push({ type: 'reverse', axis: 1 })
			layers.push({ type: 'additive_coupling' })
		}
		layers.push({ type: 'output' })

		this._model = NeuralNetwork.fromObject(layers, null, optimizer)
		this._epoch = 0
	}

	/**
	 * Epoch
	 * @type {number}
	 */
	get epoch() {
		return this._epoch
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {number} iteration Iteration count
	 * @param {number} rate Learning rate
	 * @param {number} batch_size Batch size
	 */
	fit(x, iteration, rate, batch_size) {
		for (let i = 0; i < iteration; i++) {
			for (let i = 0; i < x.length; i += batch_size) {
				const last = Math.min(x.length, i + batch_size)
				const z = this._model.calc(x.slice(i, last))
				this._model.grad(z)
				this._model.update(rate)
			}
		}
		this._epoch += iteration
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		return this._model.calc(x).toArray()
	}

	/**
	 * Returns generated values.
	 * @param {Array<Array<number>>} z Sample data
	 * @returns {Array<Array<number>>} Generated values
	 */
	generate(z) {
		z = Matrix.fromArray(z)
		for (let i = this._model._graph.size - 1; i >= 0; i--) {
			const node = this._model._graph.nodes[i]
			if (node.layer instanceof FlowLayer) {
				z = node.layer.inverse(z)
			} else if (node.layer instanceof ReverseLayer) {
				z = node.layer.calc(z)
			}
		}
		return z.toArray()
	}
}
