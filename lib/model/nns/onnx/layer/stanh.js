import { onnx } from '../onnx_exporter.js'

/**
 * Handle stanh layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'stanh'}} obj Node object
	 */
	export(model, obj) {
		const tensor_a = new onnx.TensorProto()
		tensor_a.setName(obj.name + '_a')
		tensor_a.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_a.setDimsList([1])
		tensor_a.setFloatDataList([obj.a ?? 1])
		const tensor_b = new onnx.TensorProto()
		tensor_b.setName(obj.name + '_b')
		tensor_b.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_b.setDimsList([1])
		tensor_b.setFloatDataList([obj.b ?? 1])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(input)
		node_mul.addInput(obj.name + '_b')
		node_mul.addOutput(obj.name + '_mul')

		const node_tanh = new onnx.NodeProto()
		node_tanh.setOpType('Tanh')
		node_tanh.addInput(obj.name + '_mul')
		node_tanh.addOutput(obj.name + '_tanh')

		const node_muls = new onnx.NodeProto()
		node_muls.setOpType('Mul')
		node_muls.addInput(obj.name + '_tanh')
		node_muls.addInput(obj.name + '_a')
		node_muls.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_a)
		graph.addInitializer(tensor_b)
		graph.addNode(node_mul)
		graph.addNode(node_tanh)
		graph.addNode(node_muls)
	},
}
