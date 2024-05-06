import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle constant operator
 * @module HandleONNXConstantOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#constant
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
		let value = null
		if (attrs.value != null) {
			value = attrs.value
		} else if (attrs.sparse_value != null) {
			value = attrs.sparse_value
		} else if (attrs.value_float != null) {
			value = attrs.value_float
		} else if (attrs.value_floats != null) {
			value = attrs.value_floats
		} else if (attrs.value_int != null) {
			value = attrs.value_int
		} else if (attrs.value_ints != null) {
			value = attrs.value_ints
		} else if (attrs.value_string != null) {
			value = attrs.value_string
		} else if (attrs.value_strings != null) {
			value = attrs.value_strings
		}
		return [{ type: 'const', value, name: node.getOutputList()[0] }]
	},
}
