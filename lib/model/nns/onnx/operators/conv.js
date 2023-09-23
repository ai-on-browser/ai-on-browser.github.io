import { onnx } from '../onnx_importer.js'
import { loadTensor, loadAttribute } from '../utils.js'

import Tensor from '../../../../util/tensor.js'

/**
 * Handle conv operator
 *
 * @module HandleONNXConvOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#conv
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
		const inputList = node.getInputList()
		const initializers = {}
		let channel = null
		for (const initializer of model.getGraph().getInitializerList()) {
			if (initializer.getName() === inputList[1]) {
				initializers.w = loadTensor(initializer)
				const wten = Tensor.fromArray(initializers.w)
				if (!attrs.kernel_shape) {
					attrs.kernel_shape = wten.sizes.slice(2)
				}
				channel = wten.sizes[0]
			} else if (initializer.getName() === inputList[2]) {
				initializers.b = loadTensor(initializer)
			}
		}
		if (attrs.group && attrs.group !== 1) {
			throw new Error(`Invalid attribute 'group' value ${attrs.group}.`)
		}
		if (attrs.strides && attrs.strides.some(v => v !== attrs.strides[0])) {
			throw new Error(`Invalid attribute 'strides' value ${attrs.strides}.`)
		}
		if (attrs.auto_pad === 'SAME_UPPER') {
			attrs.pads = attrs.kernel_shape.map(v => [Math.floor((v - 1) / 2), Math.ceil((v - 1) / 2)])
		} else if (attrs.auto_pad === 'SAME_LOWER') {
			attrs.pads = attrs.kernel_shape.map(v => [Math.ceil((v - 1) / 2), Math.floor((v - 1) / 2)])
		} else if (attrs.auto_pad && attrs.auto_pad !== 'NOTSET') {
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
				type: 'conv',
				input: [inputList[0]],
				name: node.getOutputList()[0],
				kernel: attrs.kernel_shape,
				channel: channel,
				padding: attrs.pads || 0,
				stride: attrs.strides ? attrs.strides[0] : null,
				w: initializers.w || inputList[1],
				channel_dim: 1,
			},
		]
	},
}
