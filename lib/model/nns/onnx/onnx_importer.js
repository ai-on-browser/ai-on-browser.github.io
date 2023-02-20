import onnx from './onnx_pb.js'
export { default as onnx } from './onnx_pb.js'

import input from './operators/input.js'
import output from './operators/output.js'

const operators = {}

/**
 * ONNX importer
 */
export default class ONNXImporter {
	/**
	 * Load onnx model.
	 *
	 * @param {Uint8Array | ArrayBuffer | File} buffer File
	 * @returns {import("../graph").LayerObject[]} Objects represented the graph
	 */
	static async load(buffer) {
		if (globalThis.File && buffer instanceof File) {
			buffer = new Uint8Array(await buffer.arrayBuffer())
		}
		if (buffer instanceof ArrayBuffer) {
			buffer = new Uint8Array(buffer)
		}
		const modelProto = onnx.ModelProto.deserializeBinary(buffer)
		const model = modelProto.toObject()

		const nodes = []
		for (const node of model.graph.inputList) {
			nodes.push(...input.import(model, node))
		}
		for (const node of model.graph.nodeList) {
			const opType = node.opType
			if (!operators[opType]) {
				try {
					const module = await import(`./operators/${opType.toLowerCase()}.js`)
					operators[opType] = module.default
				} catch (e) {
					console.error(opType, e.name, e.message)
					continue
				}
			}
			const op = operators[opType]
			nodes.push(...op.import(model, node))
		}
		for (const node of model.graph.outputList) {
			nodes.push(...output.import(model, node))
		}
		return nodes
	}
}
