import { onnx } from '../onnx_importer.js'
import { requireTensor } from '../utils.js'

/**
 * Handle add operator
 * @module HandleONNXAddOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#add
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
			{ type: 'add', input: node.getInputList(), name: node.getOutputList()[0] },
		]
	},
}
