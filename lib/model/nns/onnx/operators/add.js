import { onnx } from '../onnx_importer.js'

/**
 * Handle add operator
 * @module HandleONNXAddOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#add
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
		return [{ type: 'add', input: node.getInputList(), name: node.getOutputList()[0] }]
	},
}
