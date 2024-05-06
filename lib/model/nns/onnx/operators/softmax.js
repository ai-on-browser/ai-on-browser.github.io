import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle softmax operator
 * @module HandleONNXSoftmaxOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#Softmax
 */
export default {
	/**
	 * Import from onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.NodeProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		const attrs = { axis: -1 }
		for (const attribute of node.getAttributeList()) {
			attrs[attribute.getName()] = loadAttribute(attribute)
		}
		return [{ type: 'softmax', input: [node.getInputList()[0]], name: node.getOutputList()[0], axis: attrs.axis }]
	},
}
