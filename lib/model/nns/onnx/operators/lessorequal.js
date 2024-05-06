import { onnx } from '../onnx_importer.js'

/**
 * Handle LessOrEqual operator
 * @module HandleONNXLessOrEqualOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#LessOrEqual
 */
export default {
	/**
	 * Import from onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.NodeProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		return [{ type: 'less_or_equal', input: node.getInputList(), name: node.getOutputList()[0] }]
	},
}
