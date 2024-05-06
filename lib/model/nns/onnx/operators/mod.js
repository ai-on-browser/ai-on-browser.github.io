import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle Modulo operator
 * @module HandleONNXModOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#Mod
 */
export default {
	/**
	 * Import from onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.NodeProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		const attrs = {}
		for (const attribute of node.getAttributeList()) {
			attrs[attribute.getName()] = loadAttribute(attribute)
		}
		if (attrs.fmod === 1) {
			throw new Error(`Invalid attribute 'fmod' value ${attrs.fmod}.`)
		}
		return [{ type: 'mod', input: node.getInputList(), name: node.getOutputList()[0] }]
	},
}
