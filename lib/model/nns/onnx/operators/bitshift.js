import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle BitShift operator
 *
 * @module HandleONNXBitShiftOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#BitShift
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
		const attrs = {}
		for (const attribute of node.attributeList) {
			attrs[attribute.name] = loadAttribute(attribute)
		}
		return [
			{
				type: attrs.direction === 'RIGHT' ? 'right_bitshift' : 'left_bitshift',
				input: node.inputList,
				name: node.outputList[0],
			},
		]
	},
}
