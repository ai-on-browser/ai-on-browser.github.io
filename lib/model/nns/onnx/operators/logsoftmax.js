import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle logsoftmax operator
 * @module HandleONNXLogSoftmaxOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#LogSoftmax
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
		return [
			{ type: 'log_softmax', input: [node.getInputList()[0]], name: node.getOutputList()[0], axis: attrs.axis },
		]
	},
}
