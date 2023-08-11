import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle logsoftmax operator
 *
 * @module HandleONNXLogSoftmaxOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#LogSoftmax
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
		const attrs = { axis: -1 }
		for (const attribute of node.attributeList) {
			attrs[attribute.name] = loadAttribute(attribute)
		}
		return [{ type: 'log_softmax', input: [node.inputList[0]], name: node.outputList[0], axis: attrs.axis }]
	},
}
