import { onnx } from '../onnx_exporter.js'
import Tensor from '../../../../util/tensor.js'

/**
 * Handle convolutional layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph.js").LayerObject & {type: 'conv'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj, info) {
		const graph = model.getGraph()

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const size = info[input].size.concat()

		const node = new onnx.NodeProto()
		node.setOpType('Conv')
		const channelDim = obj.channel_dim === 1 ? 1 : size.length - 1
		if (obj.channel_dim === 1) {
			node.addInput(input)
			node.addOutput(obj.name)
		} else if (obj.channel_dim == null || obj.channel_dim === -1) {
			const node_transpose1 = new onnx.NodeProto()
			node_transpose1.setOpType('Transpose')
			node_transpose1.addInput(input)
			node_transpose1.addOutput(obj.name + '_t1')
			const attrPerm1 = new onnx.AttributeProto()
			attrPerm1.setName('perm')
			attrPerm1.setType(onnx.AttributeProto.AttributeType.INTS)
			const perm1 = Array.from(size, (_, i) => i - 1)
			perm1[0] = 0
			perm1[1] = size.length - 1
			attrPerm1.setIntsList(perm1)
			node_transpose1.addAttribute(attrPerm1)
			graph.addNode(node_transpose1)

			node.addInput(obj.name + '_t1')
			node.addOutput(obj.name + '_ap')

			const node_transpose2 = new onnx.NodeProto()
			node_transpose2.setOpType('Transpose')
			node_transpose2.addInput(obj.name + '_ap')
			node_transpose2.addOutput(obj.name)
			const attrPerm2 = new onnx.AttributeProto()
			attrPerm2.setName('perm')
			attrPerm2.setType(onnx.AttributeProto.AttributeType.INTS)
			const perm2 = Array.from(size, (_, i) => i + 1)
			perm2[0] = 0
			perm2[perm2.length - 1] = 1
			attrPerm2.setIntsList(perm2)
			node_transpose2.addAttribute(attrPerm2)
			graph.addNode(node_transpose2)
		} else {
			throw new Error(`Not implemented value of attribute 'channel_dim' ${obj.channel_dim}.`)
		}

		const kernel = Array.isArray(obj.kernel) ? obj.kernel : Array(size.length - 2).fill(obj.kernel)
		const kernelShape = new onnx.AttributeProto()
		kernelShape.setName('kernel_shape')
		kernelShape.setType(onnx.AttributeProto.AttributeType.INTS)
		kernelShape.setIntsList(kernel)
		node.addAttribute(kernelShape)
		const stride = Array.isArray(obj.stride) ? obj.stride : Array(kernel.length).fill(obj.stride ?? 1)
		const attrStrides = new onnx.AttributeProto()
		attrStrides.setName('strides')
		attrStrides.setType(onnx.AttributeProto.AttributeType.INTS)
		attrStrides.setIntsList(stride)
		node.addAttribute(attrStrides)
		if (obj.padding != null) {
			const pads = new onnx.AttributeProto()
			pads.setName('pads')
			pads.setType(onnx.AttributeProto.AttributeType.INTS)
			pads.setIntsList(
				!Array.isArray(obj.padding)
					? Array(kernel.length * 2).fill(obj.padding)
					: Array.isArray(obj.padding[0])
						? [...obj.padding.map(v => v[0]), ...obj.padding.map(v => v[1])]
						: [].concat(obj.padding, obj.padding)
			)
			node.addAttribute(pads)
		} else {
			const dims = obj.channel_dim === 1 ? size.slice(2) : size.slice(1, -1)
			if (dims.some(d => d == null)) {
				const autoPad = new onnx.AttributeProto()
				autoPad.setName('auto_pad')
				autoPad.setType(onnx.AttributeProto.AttributeType.STRING)
				autoPad.setS(new TextEncoder().encode('VALID'))
				node.addAttribute(autoPad)
			} else {
				const padding = dims.map((d, k) => (d - kernel[k]) % stride[k])
				const pads = new onnx.AttributeProto()
				pads.setName('pads')
				pads.setType(onnx.AttributeProto.AttributeType.INTS)
				pads.setIntsList([...Array(kernel.length).fill(0), ...padding])
				node.addAttribute(pads)
			}
		}

		const outSize = Array(size.length).fill(null)
		outSize[0] = size[0]
		if (typeof obj.w === 'string') {
			node.addInput(obj.w)
			outSize[channelDim] = info[obj.w].size[0]
		} else if (obj.w) {
			const tensor = new onnx.TensorProto()
			tensor.setName(obj.name + '_w')
			tensor.setDataType(onnx.TensorProto.DataType.FLOAT)
			const w = Tensor.fromArray(obj.w)
			tensor.setDimsList(w.sizes)
			tensor.setFloatDataList(w.value)
			graph.addInitializer(tensor)
			node.addInput(obj.name + '_w')
			outSize[channelDim] = w.sizes[0]
		} else {
			throw new Error(`Require attribute 'w'`)
		}

		graph.addNode(node)

		return { size: outSize }
	},
}
