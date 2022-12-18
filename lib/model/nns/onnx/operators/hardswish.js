import { onnx } from '../onnx_importer.js'

/**
 * Handle HardSwish operator
 *
 * @module HandleONNXHardSwishOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#HardSwish
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
		return [{ type: 'hard_swish', input: [node.inputList[0]], name: node.outputList[0] }]
	},
}
