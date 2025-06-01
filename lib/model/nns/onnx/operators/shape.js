import { onnx } from '../onnx_importer.js'
import { loadTensor, loadAttribute } from '../utils.js'

/**
 * Handle shape operator
 * @module HandleONNXShapeOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#shape
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
		if (attrs.start != null && attrs.start !== 0) {
			throw new Error(`Invalid attribute 'start' value ${attrs.start}.`)
		}
		if (attrs.end != null) {
			throw new Error(`Invalid attribute 'end' value ${attrs.end}.`)
		}
		return [{ type: 'shape', input: node.getInputList(), name: node.getOutputList()[0] }]
	},
}
