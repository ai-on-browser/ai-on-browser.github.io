import { onnx } from '../onnx_importer.js'
import { requireTensor } from '../utils.js'

/**
 * Handle sub operator
 *
 * @module HandleONNXSubOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#sub
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
			{ type: 'sub', input: node.inputList, name: node.outputList[0] },
		]
	},
}
