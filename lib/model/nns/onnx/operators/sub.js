import { onnx } from '../onnx_importer.js'
import { requireTensor } from '../utils.js'

/**
 * Handle sub operator
 * @module HandleONNXSubOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#sub
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
			...requireTensor(model, node.getInputList()),
			{ type: 'sub', input: node.getInputList(), name: node.getOutputList()[0] },
		]
	},
}
