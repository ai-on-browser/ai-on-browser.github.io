import Matrix from '../util/matrix.js'
import Tensor from '../util/tensor.js'
import Layer from './nns/layer/base.js'
export { default as Layer } from './nns/layer/base.js'

import ComputationalGraph from './nns/graph.js'
export { default as ComputationalGraph } from './nns/graph.js'

import * as opt from './nns/optimizer.js'

/**
 * @ignore
 * @typedef {import("./nns/graph").LayerObject} LayerObject
 */
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
	 * @param {LayerObject[]} layers Network layers
	 * @param {string} [loss] Loss name
	 * @param {'sgd' | 'adam' | 'momentum' | 'adagrad' | 'rmsprop' | 'adadelta' | 'rmspropgraves' | 'smorms3' | 'adamax' | 'nadam'} [optimizer] Optimizer of the network
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
			const cl = Layer.fromObject({ type: 'const', value: [[cn]] })
			graph.add(cl, `__const_number_${cn}`, [])
		}

		for (const l of layers) {
			const cl = Layer.fromObject(l)
			graph.add(cl, l.name, l.input)
		}

		return new NeuralNetwork(graph, optimizer)
	}

	/**
	 * Load onnx model.
	 * @param {Uint8Array | ArrayBuffer | File} buffer File
	 * @returns {Promise<NeuralNetwork>} Loaded NeuralNetwork
	 */
	static async fromONNX(buffer) {
		return new NeuralNetwork(await ComputationalGraph.fromONNX(buffer))
	}

	/**
	 * @param {ComputationalGraph} graph Graph of a network
	 * @param {'sgd' | 'adam' | 'momentum' | 'adagrad' | 'rmsprop' | 'adadelta' | 'rmspropgraves' | 'smorms3' | 'adamax' | 'nadam'} [optimizer] Optimizer of the network
	 */
	constructor(graph, optimizer = 'sgd') {
		this._graph = graph
		this._optimizer = optimizer
		if (optimizer === 'adam') {
			this._opt = new opt.AdamOptimizer()
		} else if (optimizer === 'momentum') {
			this._opt = new opt.MomentumOptimizer()
		} else if (optimizer === 'adagrad') {
			this._opt = new opt.AdaGradOptimizer()
		} else if (optimizer === 'rmsprop') {
			this._opt = new opt.RMSPropOptimizer()
		} else if (optimizer === 'adadelta') {
			this._opt = new opt.AdaDeltaOptimizer()
		} else if (optimizer === 'rmspropgraves') {
			this._opt = new opt.RMSPropGravesOptimizer()
		} else if (optimizer === 'smorms3') {
			this._opt = new opt.SMORMS3Optimizer()
		} else if (optimizer === 'adamax') {
			this._opt = new opt.AdaMaxOptimizer()
		} else if (optimizer === 'nadam') {
			this._opt = new opt.NadamOptimizer()
		} else {
			this._opt = new opt.SGDOptimizer()
		}
		this._opt_managers = []
		for (let i = 0; i < this._graph.size; i++) {
			this._opt_managers.push(this._opt.manager())
		}
	}

	_getDatasize(x) {
		if (Array.isArray(x)) {
			return x.length
		} else if (x instanceof Matrix || x instanceof Tensor) {
			return x.sizes[0]
		} else {
			for (const k of Object.keys(x)) {
				if (Array.isArray(x[k])) {
					return x[k].length
				} else if (x[k] instanceof Matrix || x[k] instanceof Tensor) {
					return x[k].sizes[0]
				}
				break
			}
		}
		return 0
	}

	/**
	 * Returns a copy of this.
	 * @returns {NeuralNetwork} Copied network
	 */
	copy() {
		return new NeuralNetwork(ComputationalGraph.fromObject(this._graph.toObject()), this._optimizer)
	}

	/**
	 * Returns object representation.
	 * @returns {LayerObject[]} Object represented this neuralnetwork
	 */
	toObject() {
		return this._graph.toObject()
	}

	/**
	 * Returns calculated values.
	 * @param {Array<Array<number | Array<number>>> | Matrix | Tensor | {[key: string]: Array<Array<number | Array<number>>> | Matrix | Tensor}} x Input value
	 * @param {Matrix} [t] Supervised value
	 * @param {string[]} [out] Name of node from which to get output
	 * @param {object} [options] Option
	 * @returns {Matrix | {[key: string]: Matrix}} Calculated values
	 */
	calc(x, t, out, options = {}) {
		const data_size = this._getDatasize(x)

		this._graph.bind({ input: x, supervisor: t, n: data_size, ...options })
		if (!out && !t) {
			const outputNodes = this._graph.outputNodes
			for (let i = 0; i < this._graph.nodes.length; i++) {
				if (this._graph.nodes[i] === outputNodes[0]) {
					this._graph.calc([i])
					return this._graph.nodes[i].outputValue
				}
			}
		}
		this._graph.calc(out)
		if (out) {
			const r = {}
			for (const node of this._graph.nodes) {
				if (out.includes(node.name)) {
					r[node.name] = node.outputValue
				}
			}
			return r
		}
		return this._graph.nodes[this._graph.size - 1].outputValue
	}

	/**
	 * Returns gradient values.
	 * @param {Matrix} [e] Input of gradient
	 * @returns {Matrix} Output of gradient
	 */
	grad(e) {
		this._graph.grad(e)
		const inNodes = this._graph.inputNodes
		return inNodes[0].gradientValue[0]
	}

	/**
	 * Update model parameters.
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
	 * @param {Array<Array<number | Array<number>>> | Matrix | Tensor | {[key: string]: Array<Array<number | Array<number>>> | Matrix | Tensor}} x Training data
	 * @param {Array<Array<number>> | Matrix} t Target values
	 * @param {number} [epoch] Iteration count
	 * @param {number} [learning_rate] Learning rate
	 * @param {number} [batch_size] Batch size
	 * @param {object} [options] Option
	 * @returns {number[]} Loss value
	 */
	fit(x, t, epoch = 1, learning_rate = 0.1, batch_size = null, options = {}) {
		const data_size = this._getDatasize(x)

		let e
		while (epoch-- > 0) {
			if (batch_size) {
				for (let i = 0; i < data_size; i += batch_size) {
					const last = Math.min(data_size, i + batch_size)
					let xi
					if (Array.isArray(x) || x instanceof Matrix || x instanceof Tensor) {
						xi = x.slice(i, last)
					} else {
						xi = {}
						for (const k of Object.keys(x)) {
							if (!x[k]) {
								continue
							}
							const xksize = Array.isArray(x[k]) ? x[k].length : x[k].sizes[0]
							xi[k] = xksize < data_size ? x[k] : x[k].slice(i, last)
						}
					}
					e = this.calc(xi, t?.slice(i, last), null, { training: true, ...options })
					this.grad()
					this.update(learning_rate)
				}
			} else {
				e = this.calc(x, t, null, { training: true, ...options })
				this.grad()
				this.update(learning_rate)
			}
		}
		return e.toArray().flat()
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number | Array<number>>> | Matrix | Tensor | {[key: string]: Array<Array<number | Array<number>>> | Matrix | Tensor}} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		return this.calc(x).toArray()
	}
}
