import { onnx } from '../onnx_importer.js'

/**
 * Handle input node
 * @module HandleONNXInputNode
 */
export default {
	/**
	 * Import from onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.ValueInfoProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	// biome-ignore lint/correctness/noUnusedFunctionParameters: the 'model' parameter is required to maintain interface consistency for ONNX imports
	import(model, node) {
		return [{ type: 'input', name: node.getName() }]
	},
}
