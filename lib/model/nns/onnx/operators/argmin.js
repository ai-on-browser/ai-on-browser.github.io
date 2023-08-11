import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle ArgMin operator
 *
 * @module HandleONNXArgMinOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#ArgMin
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
		const attrs = { axis: 0, keepdims: 1, select_last_index: 0 }
		for (const attribute of node.attributeList) {
			attrs[attribute.name] = loadAttribute(attribute)
		}
		if (attrs.select_last_index) {
			throw new Error(`Invalid attribute 'select_last_index' value ${attrs.select_last_index}.`)
		}
		return [
			{
				type: 'argmin',
				input: [node.inputList[0]],
				name: node.outputList[0],
				axis: attrs.axis,
				keepdims: !!attrs.keepdims,
			},
		]
	},
}
