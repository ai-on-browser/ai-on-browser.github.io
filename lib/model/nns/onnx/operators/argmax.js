import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle ArgMax operator
 *
 * @module HandleONNXArgMaxOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#ArgMax
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
		const attrs = { axis: 0, keepdims: 1, select_last_index: 0 }
		for (const attribute of node.getAttributeList()) {
			attrs[attribute.getName()] = loadAttribute(attribute)
		}
		if (attrs.select_last_index) {
			throw new Error(`Invalid attribute 'select_last_index' value ${attrs.select_last_index}.`)
		}
		return [
			{
				type: 'argmax',
				input: [node.getInputList()[0]],
				name: node.getOutputList()[0],
				axis: attrs.axis,
				keepdims: !!attrs.keepdims,
			},
		]
	},
}
