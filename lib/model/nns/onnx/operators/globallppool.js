import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle GlobalLpPool operator
 * @module HandleONNXGlobalLpPoolOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#GlobalLpPool
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
		return [
			{
				type: 'global_lp_pool',
				input: node.getInputList(),
				name: node.getOutputList()[0],
				p: attrs.p,
				channel_dim: 1,
			},
		]
	},
}
