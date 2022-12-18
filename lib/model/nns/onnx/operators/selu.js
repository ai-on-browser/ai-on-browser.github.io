import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle Selu operator
 *
 * @module HandleONNXSeluOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#Selu
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
		const attrs = {}
		for (const attribute of node.attributeList) {
			attrs[attribute.name] = loadAttribute(attribute)
		}
		return [{ type: 'selu', input: node.inputList, name: node.outputList[0], a: attrs.alpha, g: attrs.gamma }]
	},
}
