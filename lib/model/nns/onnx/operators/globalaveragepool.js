import { onnx } from '../onnx_importer.js'

/**
 * Handle GlobalAveragePool operator
 * @module HandleONNXGlobalAveragePoolOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#GlobalAveragePool
 */
export default {
	/**
	 * Import from onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.NodeProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		return [
			{ type: 'global_average_pool', input: node.getInputList(), name: node.getOutputList()[0], channel_dim: 1 },
		]
	},
}
