import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle flatten operator
 *
 * @module HandleONNXFlattenOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#Flatten
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
		if (attrs.axis && attrs.axis !== 1) {
			throw new Error(`Invalid attribute 'axis' value ${attrs.axis}.`)
		}
		return [{ type: 'flatten', input: node.inputList, name: node.outputList[0] }]
	},
}
