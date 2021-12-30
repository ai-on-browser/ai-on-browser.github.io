import { Tensor, Matrix } from '../util/math.js'
import { Layer } from './layer/index.js'
export { Layer } from './layer/index.js'

import InputLayer from './layer/input.js'
import OutputLayer from './layer/output.js'
import ConstLayer from './layer/const.js'

export function NeuralnetworkException(message, value) {
	this.message = message
	this.value = value
	this.name = NeuralnetworkException
}

/**
 * Graph for Neuralnetwork structure
 */
export class Graph {
	constructor() {
		this._nodes = []
	}

	/**
	 * Graph nodes
	 * @type {{layer: Layer, name: string, input?: string[], parents: {index: number, subscript?: number}[]}[]}
	 */
	get nodes() {
		return this._nodes
	}

	/**
	 * Number of nodes
	 * @type {number}
	 */
	get size() {
		return this._nodes.length
	}

	/**
	 * Returns Graph.
	 * @param {Record<string, *>[]} nodes
	 * @returns {Graph}
	 */
	static fromObject(nodes) {
		const graph = new Graph()
		for (const l of nodes) {
			const cl = Layer.fromObject(l)
			if (typeof l.input === 'string') {
				l.input = [l.input]
			}
			graph.add(cl, l.name, l.input)
		}
		return graph
	}

	/**
	 * Returns object representation.
	 * @returns {Record<string, *>[]}
	 */
	toObject() {
		const s = []
		for (let i = 0; i < this._nodes.length; i++) {
			const node = this._nodes[i]
			const obj = node.layer.toObject()
			if (node.name) {
				obj.name = node.name
			}
			if (node.input) {
				obj.input = node.input
			}
			s.push(obj)
		}
		return s
	}

	/**
	 * Add a layer.
	 * @param {Layer} layer
	 * @param {string} name
	 * @param {string[]} [inputs]
	 */
	add(layer, name, inputs = undefined) {
		let parentinfos = []
		if (!inputs) {
			if (this._nodes.length > 0) {
				parentinfos.push({
					index: this._nodes.length - 1,
					subscript: null,
				})
			}
		} else {
			parentinfos = inputs.map(p => {
				const subscriptRegexp = /\[([0-9]+)\]$/
				const m = p && p.match(subscriptRegexp)
				const subscript = m ? +m[1] : null
				const pname = m ? p.slice(0, -m[0].length) : p
				for (let k = 0; k < this._nodes.length; k++) {
					if (this._nodes[k].name === pname) {
						return {
							index: k,
							subscript,
						}
					}
				}
				throw new NeuralnetworkException(`Unknown input name '${p}'.`)
			})
		}
		this._nodes.push({
			layer,
			name,
			input: inputs,
			parents: parentinfos,
		})
	}
}

/**
 * Neuralnetwork
 */
export default class NeuralNetwork {
	/**
	 * Returns neuralnetwork.
	 * @param {Record<string, *>[]} layers
	 * @param {string} [loss]
	 * @param {'sgd' | 'adam' | 'momentum' | 'rmsprop'} optimizer
	 * @returns {NeuralNetwork}
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
		const graph = new Graph()
		for (const cn of const_numbers) {
			const cl = new ConstLayer({ value: cn })
			graph.add(cl, `__const_number_${cn}`, [])
		}
		for (const l of layers) {
			const cl = Layer.fromObject(l)
			if (typeof l.input === 'string') {
				l.input = [l.input]
			}
			graph.add(cl, l.name, l.input)
		}

		return new NeuralNetwork(graph, optimizer)
	}

	/**
	 * @param {Graph} graph
	 * @param {'sgd' | 'adam' | 'momentum' | 'rmsprop'} optimizer
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
	 * @returns {NeuralNetwork}
	 */
	copy() {
		return new NeuralNetwork(Graph.fromObject(this._graph.toObject()), this._optimizer)
	}

	/**
	 * Returns object representation.
	 * @returns {object}
	 */
	toObject() {
		return this._graph.toObject()
	}

	/**
	 * Returns calculated values.
	 * @param {Array<Array<number | Array<number>>> | Matrix | Tensor | Record<string, Array<Array<number | Array<number>>> | Matrix | Tensor>} x
	 * @param {Matrix} [t]
	 * @param {string[]} [out]
	 * @param {object} options
	 * @returns {Matrix | Record<string, Matrix>}
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
			const l = this._graph.nodes[i]
			o[i] = l.layer.calc(...l.parents.map(p => (p.subscript !== null ? o[p.index][p.subscript] : o[p.index])))
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
		}
		if (out) return r
		return o[o.length - 1]
	}

	/**
	 * Returns gradient values.
	 * @param {Matrix} [e]
	 * @returns {Matrix}
	 */
	grad(e) {
		const bi = []
		let bi_input = null
		for (let i = 0; i < this._graph.size; bi[i++] = []);
		bi[bi.length - 1] = [new Matrix(1, 1, 1)]
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
			if (bi[i].length === 0) continue
			for (let k = 0; k < bi[i].length; k++) {
				if (bi[i][k] === undefined) {
					bi[i][k] = null
				}
			}
			let bo = l.layer.grad(...bi[i])
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
	 * @param {number} learning_rate
	 */
	update(learning_rate) {
		this._opt.learningRate = learning_rate
		for (let i = 0; i < this._graph.size; i++) {
			this._graph.nodes[i].layer.update(this._opt_managers[i])
		}
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number | Array<number>>> | Matrix | Tensor | Record<string, Array<Array<number | Array<number>>> | Matrix | Tensor>} x
	 * @param {Array<Array<number>> | Matrix} t
	 * @param {number} epoch
	 * @param {number} learning_rate
	 * @param {number} batch_size
	 * @param {object} options
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
						xi = x instanceof Matrix ? x.slice(i, last) : x.slice(i, last)
					} else {
						xi = {}
						for (const k of Object.keys(x)) {
							xi[k] = x[k] instanceof Matrix ? x[k].slice(i, last) : x[k].slice(i, last)
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
}

class SGDOptimizer {
	constructor(lr) {
		this._learningrate = lr
	}

	set learningRate(value) {
		this._learningrate = value
	}

	manager() {
		const this_ = this
		return {
			get lr() {
				return this_._learningrate
			},
			delta(key, value) {
				return value.copyMult(this.lr)
			},
		}
	}
}

class MomentumOptimizer {
	constructor(lr, beta = 0.9) {
		this._learningrate = lr
		this._beta = beta
	}

	set learningRate(value) {
		this._learningrate = value
	}

	manager() {
		const this_ = this
		return {
			get lr() {
				return this_._learningrate
			},
			params: {},
			delta(key, value) {
				if (!this.params[key]) {
					this.params[key] = value
					return value.copyMult(this.lr)
				}
				const v = this.params[key].copyMult(this_._beta)
				v.add(value.copyMult(1 - this_._beta))
				this.params[key] = v
				return v.copyMult(this.lr)
			},
		}
	}
}

class RMSPropOptimizer {
	constructor(lr, beta = 0.999) {
		this._learningrate = lr
		this._beta = beta
	}

	set learningRate(value) {
		this._learningrate = value
	}

	manager() {
		const this_ = this
		return {
			get lr() {
				return this_._learningrate
			},
			params: {},
			delta(key, value) {
				if (!this.params[key]) {
					this.params[key] = value.copyMult(value)
					return value.copyMult(this.lr)
				}
				const v = this.params[key].copyMult(this_._beta)
				v.add(value.copyMap(x => (1 - this_._beta) * x * x))
				this.params[key] = v
				return value.copyMult(v.copyMap(x => this.lr / Math.sqrt(x + 1.0e-12)))
			},
		}
	}
}

class AdamOptimizer {
	constructor(lr = 0.001, beta1 = 0.9, beta2 = 0.999) {
		this._learningrate = lr
		this._beta1 = beta1
		this._beta2 = beta2
	}

	set learningRate(value) {
		this._learningrate = value
	}

	manager() {
		const this_ = this
		return {
			get lr() {
				return this_._learningrate
			},
			params: {},
			delta(key, value) {
				if (!this.params[key]) {
					this.params[key] = {
						v: value,
						s: value.copyMult(value),
					}
					return value.copyMult(this.lr)
				}
				const v = this.params[key].v.copyMult(this_._beta1)
				v.add(value.copyMult(1 - this_._beta1))
				const s = this.params[key].s.copyMult(this_._beta2)
				s.add(value.copyMap(x => (1 - this_._beta2) * x * x))
				this.params[key] = { v, s }
				return v.copyMult(s.copyMap(x => this.lr / Math.sqrt(x + 1.0e-12)))
			},
		}
	}
}
