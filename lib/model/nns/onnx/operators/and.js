import { onnx } from '../onnx_importer.js'

/**
 * Handle and operator
 *
 * @module HandleONNXAndOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#and
 */
export default {
	/**
	 * Import from onnx object.
	 *
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.NodeProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		return [{ type: 'and', input: node.getInputList(), name: node.getOutputList()[0] }]
	},
}
