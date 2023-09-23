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
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.NodeProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		return [{ type: 'sin', input: [node.getInputList()[0]], name: node.getOutputList()[0] }]
	},
}
