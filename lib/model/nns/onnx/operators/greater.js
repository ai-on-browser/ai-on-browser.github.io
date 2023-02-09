import { onnx } from '../onnx_importer.js'

/**
 * Handle greater operator
 *
 * @module HandleONNXGreaterOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#greater
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
		return [{ type: 'greater', input: node.inputList, name: node.outputList[0] }]
	},
}
