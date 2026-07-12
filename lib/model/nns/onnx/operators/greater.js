import { onnx } from '../onnx_importer.js'

/**
 * Handle greater operator
 * @module HandleONNXGreaterOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#greater
 */
export default {
	/**
	 * Import from onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.NodeProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	// biome-ignore lint/correctness/noUnusedFunctionParameters: the 'model' parameter is required to maintain interface consistency for ONNX imports
	import(model, node) {
		return [{ type: 'greater', input: node.getInputList(), name: node.getOutputList()[0] }]
	},
}
