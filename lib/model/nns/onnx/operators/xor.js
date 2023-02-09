import { onnx } from '../onnx_importer.js'

/**
 * Handle xor operator
 *
 * @module HandleONNXXorOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#xor
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
		return [{ type: 'xor', input: node.inputList, name: node.outputList[0] }]
	},
}
