import { onnx } from '../onnx_importer.js'

/**
 * Handle GlobalAveragePool operator
 *
 * @module HandleONNXGlobalAveragePoolOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#GlobalAveragePool
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
		return [{ type: 'global_average_pool', input: node.inputList, name: node.outputList[0], channel_dim: 1 }]
	},
}
