import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle thresholded Relu operator
 *
 * @module HandleONNXThresholdedReluOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#ThresholdedReLU
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
		return [{ type: 'thresholded_relu', input: node.getInputList(), name: node.getOutputList()[0], a: attrs.alpha }]
	},
}
