import { onnx } from '../onnx_importer.js'

/**
 * Handle Not operator
 *
 * @module HandleONNXNotOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#not
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
		return [{ type: 'not', input: node.inputList, name: node.outputList[0] }]
	},
}
