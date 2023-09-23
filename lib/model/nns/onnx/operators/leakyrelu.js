import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle leakyrelu operator
 *
 * @module HandleONNXLeakyReluOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#LeakyRelu
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
		const attrs = {}
		for (const attribute of node.getAttributeList()) {
			attrs[attribute.getName()] = loadAttribute(attribute)
		}
		return [
			{ type: 'leaky_relu', input: node.getInputList(), name: node.getOutputList()[0], a: attrs.alpha ?? 0.01 },
		]
	},
}
