import { onnx } from '../onnx_importer.js'

/**
 * Handle sin operator
 *
 * @module HandleONNXSinOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#sin
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
		return [{ type: 'sin', input: [node.inputList[0]], name: node.outputList[0] }]
	},
}
