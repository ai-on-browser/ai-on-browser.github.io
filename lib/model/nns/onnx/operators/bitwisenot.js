import { onnx } from '../onnx_importer.js'

/**
 * Handle BitwiseNot operator
 *
 * @module HandleONNXBitwiseNotOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#BitwiseNot
 */
export default {
	/**
	 * Import from onnx object.
	 *
	 * @param {onnx.ModelProto.AsObject} model Model object
	 * @param {onnx.NodeProto.AsObject} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		return [{ type: 'bitwise_not', input: node.inputList, name: node.outputList[0] }]
	},
}
