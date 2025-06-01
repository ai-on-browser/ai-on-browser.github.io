import Matrix from '../../util/matrix.js'
import { NeuralnetworkException } from '../neuralnetwork.js'
import Layer from './layer/base.js'
import { InputLayer, OutputLayer, ConstLayer } from './layer/index.js'
import ONNXExporter from './onnx/onnx_exporter.js'
import ONNXImporter from './onnx/onnx_importer.js'

/**
 * @ignore
 * @typedef {import("./layer/index").PlainLayerObject} PlainLayerObject
 */
/**
 * @typedef {PlainLayerObject & {input?: string | number | (string | number)[], name?: string}} LayerObject
 */

class Node {
	/**
	 * @param {string} name Name of this node
	 * @param {PlainLayerObject} layer Layer
	 * @param {(string | number)[]} input Input node names
	 * @param {{index: number, subscript: number | null}[]} parent Parent node informations
	 * @param {ComputationalGraph} graph graph
	 */
	constructor(name, layer, input, parent, graph) {
		this.name = name
		this.layer = layer
		this.input = input

		this._graph = graph
		this._parent = parent
	}

	get parents() {
		if (this._parent) {
			return this._parent
		}
		const numberSubscriptRegexp = /\[([0-9]+)\]$/
		const stringSubscriptRegexp = /\[([a-zA-Z_][0-9a-zA-Z_]*)\]$/
		return (this._parent = this.input.map(p => {
			if (typeof p === 'number') {
				return new ConstLayer({ value: p })
			}
			const nm = p && p.match(numberSubscriptRegexp)
			const sm = p && p.match(stringSubscriptRegexp)
			const subscript = nm ? +nm[1] : sm ? sm[1] : null
			const pname = nm || sm ? p.slice(0, -(nm || sm)[0].length) : p
			for (let k = 0; k < this._graph._nodes.length; k++) {
				if (this._graph._nodes[k].name === pname) {
					return { index: k, subscript }
				}
			}
			throw new NeuralnetworkException(`Unknown input name '${p}'.`)
		}))
	}

	/**
	 * Output value of this node to next layer
	 * @type {Matrix | Matrix[]}
	 */
	get outputValue() {
		return this._outputValue
	}

	/**
	 * @param {Matrix | Matrix[]} value Output value of this node to next layer
	 */
	set outputValue(value) {
		this._outputValue = value
	}

	/**
	 * Gradient value of this node from next layer
	 * @type {Matrix[]}
	 */
	get gradientValue() {
		return this._gradientValue
	}

	/**
	 * @param {Matrix[]} value Gradient value of this node from next layer
	 */
	set gradientValue(value) {
		this._gradientValue = value
	}

	/**
	 * Returns object representation.
	 * @returns {LayerObject} Object represented this node
	 */
	toObject() {
		const obj = this.layer.toObject()
		if (this.name) {
			obj.name = this.name
		}
		if (this.input) {
			obj.input = this.input
		}
		return obj
	}
}

/**
 * Computational graph for Neuralnetwork structure
 */
export default class ComputationalGraph {
	constructor() {
		this._nodes = []
		this._order = null
	}

	/**
	 * Graph nodes
	 * @type {Node[]}
	 */
	get nodes() {
		return this._nodes
	}

	/**
	 * Input nodes
	 * @type {Node[]}
	 */
	get inputNodes() {
		const n = []
		for (let i = 0; i < this._nodes.length; i++) {
			if (this._nodes[i].layer instanceof InputLayer) {
				n.push(this._nodes[i])
			}
		}
		return n
	}

	/**
	 * Output nodes
	 * @type {Node[]}
	 */
	get outputNodes() {
		const n = []
		for (let i = 0; i < this._nodes.length; i++) {
			if (this._nodes[i].layer instanceof OutputLayer) {
				n.push(this._nodes[i])
			}
		}
		return n
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
	 * @param {LayerObject[]} nodes Array of object represented a graph
	 * @returns {ComputationalGraph} Graph
	 */
	static fromObject(nodes) {
		const graph = new ComputationalGraph()
		for (const l of nodes) {
			const cl = Layer.fromObject(l)
			graph.add(cl, l.name, l.input)
		}
		return graph
	}

	/**
	 * Load onnx model.
	 * @param {Uint8Array | ArrayBuffer | File} buffer File
	 * @returns {Promise<ComputationalGraph>} Loaded graph
	 */
	static async fromONNX(buffer) {
		return ComputationalGraph.fromObject(await ONNXImporter.load(buffer))
	}

	/**
	 * Returns object representation.
	 * @returns {LayerObject[]} Object represented this graph
	 */
	toObject() {
		return this._nodes.map(node => node.toObject())
	}

	/**
	 * Returns a string of DOT format.
	 * @returns {string} String of DOT format
	 */
	toDot() {
		let s = 'digraph g {\n'
		const constNumbers = new Set()
		for (let i = 0; i < this._nodes.length; i++) {
			const node = this.nodes[i]
			const label = node.layer.constructor.name + (node.name ? `\\n${node.name}` : '')
			s += `  l${i} [label="${label}"];\n`
			for (const parent of node.parents) {
				if (parent instanceof ConstLayer) {
					s += `  c${parent._value} -> l${i};\n`
					constNumbers.add(parent._value)
				} else {
					s += `  l${parent.index} -> l${i};\n`
				}
			}
		}
		for (const cn of constNumbers) {
			s += `  c${cn} [label="Constant\\n${cn}"];\n`
		}
		return s + '}'
	}

	/**
	 * Returns onnx model
	 * @returns {Uint8Array} onnx model byte array
	 */
	toONNX() {
		return ONNXExporter.dump(this.toObject())
	}

	/**
	 * Add a layer.
	 * @param {Layer | PlainLayerObject} layer Added layer
	 * @param {string} [name] Node name
	 * @param {(string | number)[] | string | number} [inputs] Input node names or const value for the added layer
	 */
	add(layer, name, inputs = undefined) {
		this._order = null
		if (!(layer instanceof Layer)) {
			layer = Layer.fromObject(layer)
		}
		let parentinfos = null
		if (inputs == null) {
			parentinfos = []
			if (layer.calc.length > 0 && this._nodes.length > 0) {
				parentinfos.push({ index: this._nodes.length - 1, subscript: null })
			}
		} else if (!Array.isArray(inputs)) {
			inputs = [inputs]
		}
		layer.graph = this
		const node = new Node(name, layer, inputs, parentinfos, this)
		if (name && this.getNode(name)) {
			throw new NeuralnetworkException(`Duplicate layer name ${name}`)
		}
		this._nodes.push(node)
	}

	/**
	 * Bind values to layers
	 * @param {object} values Binding values
	 */
	bind(values) {
		for (const l of this._nodes) {
			l.layer.bind(values)
		}
	}

	_calcOrder() {
		if (this._order) {
			return
		}
		const s = []
		const outputList = Array.from(this._nodes, () => [])
		const addedParentCount = Array(this._nodes.length).fill(0)
		for (let i = 0; i < this._nodes.length; i++) {
			const node = this._nodes[i]
			for (const parent of node.parents) {
				if (!(parent instanceof ConstLayer)) {
					outputList[parent.index].push(i)
					addedParentCount[i]++
				}
			}
			for (const name of node.layer.dependentLayers) {
				for (let k = 0; k < this._nodes.length; k++) {
					if (i !== k && this._nodes[k].name === name && !outputList[k].includes(i)) {
						outputList[k].push(i)
						addedParentCount[i]++
						break
					}
				}
			}
			if (addedParentCount[i] === 0) {
				s.push(i)
			}
		}
		this._order = []
		while (s.length > 0) {
			s.sort((a, b) => b - a)
			const n = s.pop()
			this._order.push(n)
			for (const i of outputList[n]) {
				addedParentCount[i]--
				if (addedParentCount[i] === 0) {
					s.push(i)
				}
			}
		}
		if (addedParentCount.some(v => v !== 0)) {
			throw new Error('This graph is not directed acyclic graph.')
		}
	}

	/**
	 * Returns calculated values.
	 * @param {(string | number)[]} [require] Name or index of nodes at least calculated
	 */
	calc(require) {
		this._calcOrder()
		for (let i = 0; i < this._nodes.length; i++) {
			this._nodes[i].outputValue = null
			this._nodes[i].gradientValue = null
		}
		const o = []
		const r = require ? Array(require.length).fill(false) : []
		for (const i of this._order) {
			try {
				const l = this._nodes[i]
				o[i] = l.layer.calc(
					...l.parents.map(p =>
						p instanceof ConstLayer
							? p.calc()
							: typeof p.subscript === 'number'
								? o[p.index][p.subscript]
								: p.subscript !== null
									? this._nodes[p.index].layer[p.subscript]
									: o[p.index]
					)
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
				throw new NeuralnetworkException(`Error raises at ${i} layer. ${e.stack}`)
			}
		}
	}

	/**
	 * Returns gradient values.
	 * @param {Matrix} [e] Input of gradient
	 * @returns {Matrix} Output of gradient
	 */
	grad(e) {
		this._calcOrder()
		const n = this._nodes.length
		const bi = Array.from(this._nodes, () => [])
		const initGrad = this._nodes[n - 1].outputValue?.copy() ?? new Matrix(1, 1)
		initGrad.fill(1)
		bi[n - 1] = [initGrad]
		let bi_input = null
		for (const i of [...this._order].reverse()) {
			const l = this._nodes[i]
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
			l.gradientValue = bi[i]
			let bo = l.layer.grad(...bi[i])
			if (!Array.isArray(bo)) {
				bo = Array(l.parents.length).fill(bo)
			}
			if (bo[bo.length - 1]?.constructor === Object) {
				const optParents = bo.pop()
				for (let k = 0; k < i; k++) {
					const op = optParents[this._nodes[k].name]
					if (op) {
						if (!bi[k][0]) {
							bi[k][0] = op.copy()
						} else {
							bi[k][0].broadcastOperate(op, (a, b) => a + b)
						}
					}
				}
			}
			l.parents.forEach((p, k) => {
				if (p instanceof ConstLayer || !bo[k]) return
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
