import { onnx } from '../onnx_exporter.js'

/**
 * Handle upsampling layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'up_sampling'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj, info) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const inSize = info[input].size
		const scale = Array.isArray(obj.size) ? obj.size : Array(inSize.length - 2).fill(obj.size)
		scale.unshift(1)
		if (obj.channel_dim == null || obj.channel_dim === -1) {
			scale.push(1)
		} else if (obj.channel_dim === 1) {
			scale.splice(1, 0, 1)
		}
		const outSize = inSize.map((v, i) => (v == null ? null : v * scale[i]))

		const tensor_scale = new onnx.TensorProto()
		tensor_scale.setName(obj.name + '_scale')
		tensor_scale.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_scale.setDimsList([scale.length])
		tensor_scale.setFloatDataList(scale)

		const node = new onnx.NodeProto()
		node.setOpType('Resize')
		node.addInput(input)
		node.addInput('')
		node.addInput(obj.name + '_scale')
		node.addOutput(obj.name)
		const mode = new onnx.AttributeProto()
		mode.setName('mode')
		mode.setType(onnx.AttributeProto.AttributeType.STRING)
		mode.setS(new TextEncoder().encode('nearest'))
		node.addAttribute(mode)

		const graph = model.getGraph()
		graph.addInitializer(tensor_scale)
		graph.addNode(node)
		return { size: outSize }
	},
}
