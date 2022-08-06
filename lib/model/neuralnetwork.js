import Matrix from '../util/matrix.js'
import Tensor from '../util/tensor.js'
import { Layer, LossLayer } from './nns/layer/index.js'
export { Layer } from './nns/layer/index.js'

import ComputationalGraph from './nns/graph.js'
export { default as ComputationalGraph } from './nns/graph.js'

import { SGDOptimizer, MomentumOptimizer, RMSPropOptimizer, AdamOptimizer } from './nns/optimizer.js'

import InputLayer from './nns/layer/input.js'
import OutputLayer from './nns/layer/output.js'

/**
 * Exception for neuralnetwork class
 */
export class NeuralnetworkException extends Error {
	/**
	 * @param {string} message Error message
	 * @param {*} value Some value
	 */
	constructor(message, value) {
		super(message)
		this.value = value
		this.name = 'NeuralnetworkException'
	}
}

/**
 * Neuralnetwork
 */
export default class NeuralNetwork {
	/**
	 * Returns neuralnetwork.
	 *
	 * @param {Object<string, *>[]} layers Network layers
	 * @param {string} [loss] Loss name
	 * @param {'sgd' | 'adam' | 'momentum' | 'rmsprop'} [optimizer=sgd] Optimizer of the network
	 * @returns {NeuralNetwork} Created Neuralnetwork
	 */
	static fromObject(layers, loss, optimizer = 'sgd') {
		if (layers.filter(l => l.type === 'output').length === 0) {
			layers.push({ type: 'output' })
		}
		if (loss) {
			layers.push({ type: loss })
		}
		const const_numbers = new Set()
		for (const l of layers) {
			if (l.input && Array.isArray(l.input)) {
				for (let i = 0; i < l.input.length; i++) {
					if (typeof l.input[i] === 'number') {
						const_numbers.add(l.input[i])
						l.input[i] = `__const_number_${l.input[i]}`
					}
				}
			}
		}
		if (const_numbers.size) {
			layers[0].input = []
		}
		const graph = new ComputationalGraph()
		for (const cn of const_numbers) {
			const cl = Layer.fromObject({ type: 'const', value: cn })
			graph.add(cl, `__const_number_${cn}`, [])
		}

		let hasLossLayer = false
		for (const l of layers) {
			const cl = Layer.fromObject(l)
			graph.add(cl, l.name, l.input)

			hasLossLayer ||= cl instanceof LossLayer
		}
		if (!hasLossLayer) {
			graph.add(new LossLayer({}))
		}

		return new NeuralNetwork(graph, optimizer)
	}

	/**
	 * @param {ComputationalGraph} graph Graph of a network
	 * @param {'sgd' | 'adam' | 'momentum' | 'rmsprop'} [optimizer=sgd] Optimizer of the network
	 */
	constructor(graph, optimizer = 'sgd') {
		this._graph = graph
		this._optimizer = optimizer
		if (optimizer === 'adam') {
			this._opt = new AdamOptimizer()
		} else if (optimizer === 'momentum') {
			this._opt = new MomentumOptimizer()
		} else if (optimizer === 'rmsprop') {
			this._opt = new RMSPropOptimizer()
		} else {
			this._opt = new SGDOptimizer()
		}
		this._opt_managers = []
		for (let i = 0; i < this._graph.size; i++) {
			this._opt_managers.push(this._opt.manager())
		}
	}

	/**
	 * Returns a copy of this.
	 *
	 * @returns {NeuralNetwork} Copied network
	 */
	copy() {
		return new NeuralNetwork(ComputationalGraph.fromObject(this._graph.toObject()), this._optimizer)
	}

	/**
	 * Returns object representation.
	 *
	 * @returns {object} Object represented this neuralnetwork
	 */
	toObject() {
		return this._graph.toObject()
	}

	/**
	 * Returns calculated values.
	 *
	 * @param {Array<Array<number | Array<number>>> | Matrix | Tensor | Object<string, Array<Array<number | Array<number>>> | Matrix | Tensor>} x Input value
	 * @param {Matrix} [t] Supervised value
	 * @param {string[]} [out] Name of node from which to get output
	 * @param {object} [options={}] Option
	 * @returns {Matrix | Object<string, Matrix>} Calculated values
	 */
	calc(x, t, out, options = {}) {
		let data_size = 0
		if (Array.isArray(x)) {
			x = Tensor.fromArray(x)
			if (x.dimension === 2) {
				x = x.toMatrix()
			}
			data_size = x.sizes[0]
		} else if (!(x instanceof Matrix || x instanceof Tensor)) {
			for (const k of Object.keys(x)) {
				x[k] = Tensor.fromArray(x[k])
				if (x[k].dimension === 2) {
					x[k] = x[k].toMatrix()
				}
				data_size = x[k].sizes[0]
			}
		} else {
			data_size = x.sizes[0]
		}

		for (const l of this._graph.nodes) {
			l.layer.bind({ input: x, supervisor: t, n: data_size, ...options })
		}
		const o = []
		const r = {}
		for (let i = 0; i < this._graph.size; i++) {
			try {
				const l = this._graph.nodes[i]
				o[i] = l.layer.calc(
					...l.parents.map(p => (p.subscript !== null ? o[p.index][p.subscript] : o[p.index]))
				)
				l.lastOutputValue = o[i]
				if (out && out.indexOf(l.name) >= 0) {
					r[l.name] = o[i]
					if (Object.keys(r).length === out.length) {
						return r
					}
				}
				if (!t && l.layer instanceof OutputLayer) {
					if (out) return r
					return o[i]
				}
			} catch (e) {
				throw new Error(`Error raises at ${i} layer. ${e.stack}`)
			}
		}
		if (out) return r
		return o[o.length - 1]
	}

	/**
	 * Returns gradient values.
	 *
	 * @param {Matrix} [e] Input of gradient
	 * @returns {Matrix} Output of gradient
	 */
	grad(e) {
		const bi = []
		let bi_input = null
		for (let i = 0; i < this._graph.size; bi[i++] = []);
		for (let i = this._graph.size - 1; i >= 0; i--) {
			const l = this._graph.nodes[i]
			if (e) {
				if (l.layer instanceof OutputLayer) {
					bi[i] = [e]
					e = null
				} else {
					continue
				}
			}
			if (!(l.layer instanceof LossLayer) && bi[i].length === 0) continue
			for (let k = 0; k < bi[i].length; k++) {
				if (bi[i][k] === undefined) {
					bi[i][k] = null
				}
			}
			let bo = l.layer.grad(...bi[i])
			l.lastGradientValue = bo
			if (!Array.isArray(bo)) {
				bo = Array(l.parents.length).fill(bo)
			}
			l.parents.forEach((p, k) => {
				if (!bo[k]) return
				const subidx = p.subscript || 0
				if (!bi[p.index][subidx]) {
					bi[p.index][subidx] = bo[k].copy()
				} else {
					bi[p.index][subidx].add(bo[k])
				}
			})
			if (l.layer instanceof InputLayer) {
				bi_input = bi[i][0]
			}
		}
		return bi_input
	}

	/**
	 * Update model parameters.
	 *
	 * @param {number} learning_rate Learning rate
	 */
	update(learning_rate) {
		this._opt.learningRate = learning_rate
		for (let i = 0; i < this._graph.size; i++) {
			this._graph.nodes[i].layer.update(this._opt_managers[i])
		}
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number | Array<number>>> | Matrix | Tensor | Object<string, Array<Array<number | Array<number>>> | Matrix | Tensor>} x Training data
	 * @param {Array<Array<number>> | Matrix} t Target values
	 * @param {number} [epoch=1] Iteration count
	 * @param {number} [learning_rate=0.1] Learning rate
	 * @param {number} [batch_size] Batch size
	 * @param {object} [options] Option
	 * @returns {number[]} Loss value
	 */
	fit(x, t, epoch = 1, learning_rate = 0.1, batch_size = null, options = {}) {
		if (Array.isArray(x)) {
			x = Tensor.fromArray(x)
			if (x.dimension === 2) {
				x = x.toMatrix()
			}
		} else if (!(x instanceof Matrix || x instanceof Tensor)) {
			for (const k of Object.keys(x)) {
				x[k] = Tensor.fromArray(x[k])
				if (x[k].dimension === 2) {
					x[k] = x[k].toMatrix()
				}
			}
		}
		t = Matrix.fromArray(t)

		let e
		while (epoch-- > 0) {
			if (batch_size) {
				for (let i = 0; i < t.rows; i += batch_size) {
					const last = Math.min(t.rows, i + batch_size)
					let xi
					if (x instanceof Matrix || x instanceof Tensor) {
						xi = x.slice(i, last)
					} else {
						xi = {}
						for (const k of Object.keys(x)) {
							xi[k] = x[k].sizes[0] < t.rows ? x[k] : x[k].slice(i, last)
						}
					}
					e = this.calc(xi, t.slice(i, last), null, options)
					this.grad()
					this.update(learning_rate)
				}
			} else {
				e = this.calc(x, t, null, options)
				this.grad()
				this.update(learning_rate)
			}
		}
		return e.toArray().flat()
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number | Array<number>>> | Matrix | Tensor | Object<string, Array<Array<number | Array<number>>> | Matrix | Tensor>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		return this.calc(x).toArray()
	}
}
