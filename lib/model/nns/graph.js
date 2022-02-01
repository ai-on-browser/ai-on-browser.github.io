import { MatrixException } from '../../util/matrix.js'
import { NeuralnetworkException } from '../neuralnetwork.js'
import { Layer } from './layer/index.js'

/**
 * @typedef {object} Node
 * @property {Layer} layer
 * @property {string} name
 * @property {string[]} [input]
 * @property {{index: number, subscript?: number}[]} parents
 */
/**
 * Graph for Neuralnetwork structure
 */
export default class Graph {
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
	 *
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
	 *
	 * @param {Layer} layer
	 * @param {string} [name]
	 * @param {string[] | string} [inputs]
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
			lastOutputValue: null,
			lastGradientValue: null,
			get lastOutputSize() {
				return this.lastOutputValue.sizes
			},
		}
		if (name && this.getNode(name)) {
			throw new MatrixException(`Duplicate layer name ${name}`)
		}
		this._nodes.push(node)
	}

	/**
	 * Returns a specific name node.
	 *
	 * @param {string} name
	 * @returns {Node=}
	 */
	getNode(name) {
		for (let i = 0; i < this._nodes.length; i++) {
			if (this._nodes[i].name === name) {
				return this._nodes[i]
			}
		}
	}
}