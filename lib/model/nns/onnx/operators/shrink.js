import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle shrink operator
 *
 * @module HandleONNXShrinkOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#Shrink
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
		const attrs = { bias: 0, lambd: 0.5 }
		for (const attribute of node.getAttributeList()) {
			attrs[attribute.getName()] = loadAttribute(attribute)
		}
		if (attrs.bias === 0) {
			return [{ type: 'hard_shrink', input: node.getInputList(), name: node.getOutputList()[0], l: attrs.lambd }]
		} else if (attrs.bias === attrs.lambd) {
			return [{ type: 'soft_shrink', input: node.getInputList(), name: node.getOutputList()[0], l: attrs.lambd }]
		} else {
			throw new Error(`Invalid attribute 'bias' value ${attrs.bias}.`)
		}
	},
}
