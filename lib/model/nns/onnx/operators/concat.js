import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle concat operator
 * @module HandleONNXConcatOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#concat
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
		return [{ type: 'concat', input: node.getInputList(), name: node.getOutputList()[0], axis: attrs.axis }]
	},
}
