import Matrix, { MatrixException } from '../../util/matrix.js'
import { NeuralnetworkException } from '../neuralnetwork.js'
import Layer, { LossLayer } from './layer/base.js'
import { InputLayer, OutputLayer } from './layer/index.js'

/**
 * @typedef {import("./layer/index").PlainLayerObject & {input?: string | string[], name?: string}} LayerObject
 * @typedef {object} Node
 * @property {Layer} layer Layer
 * @property {string} name Name of the node
 * @property {string[]} [input] Input node names
 * @property {{index: number, subscript?: number}[]} parents Parent node informations
 * @property {Matrix | Matrix[]} [outputValue] Output value of this node to next layer
 * @property {Matrix[]} [gradientValue] Gradient value of this node from next layer
 */
/**
 * Computational graph for Neuralnetwork structure
 */
export default class ComputationalGraph {
	constructor() {
		this._nodes = []
	}

	/**
	 * Graph nodes
	 *
	 * @type {Node[]}
	 */
	get nodes() {
		return this._nodes
	}

	/**
	 * Number of nodes
	 *
	 * @type {number}
	 */
	get size() {
		return this._nodes.length
	}

	/**
	 * Returns Graph.
	 *
	 * @param {LayerObject[]} nodes Array of object represented a graph
	 * @returns {ComputationalGraph} Graph
	 */
	static fromObject(nodes) {
		const graph = new ComputationalGraph()
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
	 *
	 * @returns {LayerObject[]} Object represented this graph
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
	 *
	 * @param {Layer} layer Added layer
	 * @param {string} [name] Node name
	 * @param {string[] | string} [inputs] Input node names for the added layer
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
			if (typeof inputs === 'string') {
				inputs = [inputs]
			}
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
		layer.graph = this
		const node = {
			layer,
			name,
			input: inputs,
			parents: parentinfos,
			outputValue: null,
			gradientValue: null,
			get lastOutputSize() {
				return this.outputValue.sizes
			},
		}
		if (name && this.getNode(name)) {
			throw new MatrixException(`Duplicate layer name ${name}`)
		}
		this._nodes.push(node)
	}

	/**
	 * Bind values to layers
	 *
	 * @param {object} values Binding values
	 */
	bind(values) {
		for (const l of this._nodes) {
			l.layer.bind(values)
		}
	}

	/**
	 * Returns calculated values.
	 *
	 * @param {(string | number)[]} [require] Name or index of nodes at least calculated
	 */
	calc(require) {
		for (let i = 0; i < this._nodes.length; i++) {
			this._nodes[i].outputValue = null
			this._nodes[i].gradientValue = null
		}
		const o = []
		const r = require ? Array(require.length).fill(false) : []
		for (let i = 0; i < this._nodes.length; i++) {
			try {
				const l = this._nodes[i]
				o[i] = l.layer.calc(
					...l.parents.map(p => (p.subscript !== null ? o[p.index][p.subscript] : o[p.index]))
				)
				l.outputValue = o[i]
				if (require) {
					for (let j = 0; j < require.length; j++) {
						if (typeof require[j] === 'number' && require[j] === i) {
							r[j] = true
						} else if (require[j] === l.name) {
							r[j] = true
						}
					}
					if (r.every(v => v)) {
						return
					}
				}
			} catch (e) {
				throw new Error(`Error raises at ${i} layer. ${e.stack}`)
			}
		}
	}

	/**
	 * Returns gradient values.
	 *
	 * @param {Matrix} [e] Input of gradient
	 * @returns {Matrix} Output of gradient
	 */
	grad(e) {
		const bi = Array.from({ length: this._nodes.length }, () => [])
		let bi_input = null
		for (let i = this._nodes.length - 1; i >= 0; i--) {
			const l = this._nodes[i]
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
			l.gradientValue = bi[i]
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
					bi[p.index][subidx].broadcastOperate(bo[k], (a, b) => a + b)
				}
			})
			if (l.layer instanceof InputLayer) {
				bi_input = bi[i][0]
			}
		}
		return bi_input
	}

	/**
	 * Returns a specific name node.
	 *
	 * @param {string} name Node name
	 * @returns {Node=} Node
	 */
	getNode(name) {
		for (let i = 0; i < this._nodes.length; i++) {
			if (this._nodes[i].name === name) {
				return this._nodes[i]
			}
		}
		return
	}
}
