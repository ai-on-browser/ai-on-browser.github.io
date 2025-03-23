import onnx from './onnx_pb.js'
export { default as onnx } from './onnx_pb.js'

import input from './operators/input.js'
import output from './operators/output.js'

import * as operators from './operators/index.js'
import { loadTensor } from './utils.js'

/**
 * ONNX importer
 */
export default class ONNXImporter {
	/**
	 * Load onnx model.
	 * @param {Uint8Array | ArrayBuffer | Blob} buffer File
	 * @returns {import("../graph").LayerObject[]} Objects represented the graph
	 */
	static async load(buffer) {
		if (buffer.arrayBuffer && typeof buffer.arrayBuffer === 'function') {
			buffer = new Uint8Array(await buffer.arrayBuffer())
		}
		if (buffer instanceof ArrayBuffer) {
			buffer = new Uint8Array(buffer)
		}
		const model = onnx.ModelProto.deserializeBinary(buffer)
		const graph = model.getGraph()

		const nodes = []
		for (const node of graph.getInputList()) {
			nodes.push(...input.import(model, node))
		}
		for (const node of graph.getNodeList()) {
			const opType = node.getOpType()
			if (!operators[opType.toLowerCase()]) {
				console.error(`Unimplemented operator ${opType}.`)
				continue
			}
			const op = operators[opType.toLowerCase()]
			nodes.push(...op.import(model, node))
		}
		for (const node of graph.getOutputList()) {
			nodes.push(...output.import(model, node))
		}

		const importedNames = new Set(nodes.map(n => n.name))
		const inputNames = new Map(graph.getInitializerList().map(init => [init.getName(), init]))
		for (const node of nodes.filter(n => n.input)) {
			const inputs = Array.isArray(node.input) ? node.input : [node.input]
			for (const i of inputs) {
				if (importedNames.has(i)) {
					continue
				}
				const initializer = inputNames.get(i)
				if (initializer) {
					nodes.push({ type: 'const', name: i, value: loadTensor(initializer) })
					importedNames.add(i)
				}
			}
		}
		return nodes
	}
}
