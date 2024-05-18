import onnx from './onnx_pb.js'
export { default as onnx } from './onnx_pb.js'

import input from './operators/input.js'
import output from './operators/output.js'

import * as operators from './operators/index.js'

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
		return nodes
	}
}
