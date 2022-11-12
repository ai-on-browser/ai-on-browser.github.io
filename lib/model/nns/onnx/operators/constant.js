import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#constant
 */
export default {
	/**
	 * Import fron onnx object.
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
		if (!attrs.value) {
			throw new Error('Non supported type.')
		}
		return [{ type: 'const', value: attrs.value, name: node.outputList[0] }]
	},
}
