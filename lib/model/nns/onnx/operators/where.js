import { onnx } from '../onnx_importer.js'

/**
 * Handle where operator
 * @module HandleONNXLessOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#where
 */
export default {
	/**
	 * Import from onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.NodeProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		return [{ type: 'cond', input: node.getInputList(), name: node.getOutputList()[0] }]
	},
}
