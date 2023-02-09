import { onnx } from '../onnx_importer.js'
import { requireTensor } from '../utils.js'

/**
 * Handle min operator
 *
 * @module HandleONNXMinOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#min
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
		return [
			...requireTensor(model, node.inputList),
			{ type: 'min', input: node.inputList, name: node.outputList[0] },
		]
	},
}
