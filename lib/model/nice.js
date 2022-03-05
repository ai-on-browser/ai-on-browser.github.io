import NeuralNetwork from './neuralnetwork.js'
import { FlowLayer } from './nns/layer/base.js'
import ReverseLayer from './nns/layer/reverse.js'
import Matrix from '../util/matrix.js'

/**
 * Flow-based generative model
 * non-linear independent component estimation
 */
export default class NICE {
	// https://qiita.com/shionhonda/items/0fb7f91a150dff604cc5
	// https://deeplearning.jp/flow-based-deep-generative-models/
	/**
	 * @param {number} layer_number
	 * @param {string} optimizer
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
		this._p = z => {
			return Matrix.map(z, v => Math.exp(-(v ** 2) / 2) / Math.sqrt(2 * Math.PI))
		}
	}

	/**
	 * Epoch
	 *
	 * @type {number}
	 */
	get epoch() {
		return this._epoch
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x
	 * @param {number} iteration
	 * @param {number} rate
	 * @param {number} batch_size
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
	 *
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		return this._model.calc(x).toArray()
	}

	/**
	 * Returns generated values.
	 *
	 * @param {Array<Array<number>>} z
	 * @returns {Array<Array<number>>}
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
