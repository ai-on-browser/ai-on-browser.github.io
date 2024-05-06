import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle IsInf operator
 * @module HandleONNXIsInfOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#IsInf
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
		if (attrs.detect_negative === 0) {
			throw new Error(`Invalid attribute 'detect_negative' value ${attrs.detect_negative}.`)
		}
		if (attrs.detect_positive === 0) {
			throw new Error(`Invalid attribute 'detect_positive' value ${attrs.detect_positive}.`)
		}
		return [{ type: 'is_inf', input: node.getInputList(), name: node.getOutputList()[0] }]
	},
}
