import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle lrn operator
 *
 * @module HandleONNXLRNOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#LRN
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
		return [
			{
				type: 'lrn',
				input: [node.inputList[0]],
				name: node.outputList[0],
				alpha: attrs.alpha || 0.0001,
				beta: attrs.beta || 0.75,
				k: attrs.bias || 1.0,
				n: attrs.size,
				channel_dim: 1,
			},
		]
	},
}
