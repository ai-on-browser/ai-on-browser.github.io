import { onnx } from '../onnx_importer.js'

/**
 * Handle softplus operator
 *
 * @module HandleONNXSoftplusOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#Softplus
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
		return [{ type: 'softplus', input: [node.getInputList()[0]], name: node.getOutputList()[0], beta: 1 }]
	},
}
