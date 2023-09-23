import { onnx } from '../onnx_importer.js'
import { loadAttribute } from '../utils.js'

/**
 * Handle maxpool operator
 *
 * @module HandleONNXMaxPoolOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#maxpool
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
		if (attrs.strides && attrs.strides.some(v => v !== attrs.strides[0])) {
			throw new Error(`Invalid attribute 'strides' value ${attrs.strides}.`)
		}
		if (attrs.auto_pad && attrs.auto_pad !== 'NOTSET') {
			throw new Error(`Invalid attribute 'auto_pad' value ${attrs.auto_pad}.`)
		} else if (attrs.pads) {
			const p = []
			for (let i = 0; i < attrs.pads.length / 2; i++) {
				p.push([attrs.pads[i], attrs.pads[i + attrs.pads.length / 2]])
			}
			attrs.pads = p
		}
		return [
			{
				type: 'max_pool',
				input: [node.getInputList()[0]],
				name: node.getOutputList()[0],
				kernel: attrs.kernel_shape,
				padding: attrs.pads || 0,
				stride: attrs.strides ? attrs.strides[0] : 1,
				channel_dim: 1,
			},
		]
	},
}
