import { onnx } from '../onnx_importer.js'

/**
 * Handle sinh operator
 * @module HandleONNXSinhOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#sinh
 */
export default {
	/**
	 * Import from onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.NodeProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		return [{ type: 'sinh', input: [node.getInputList()[0]], name: node.getOutputList()[0] }]
	},
}
