import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle ptanh layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'ptanh'}} obj Node object
	 */
	export(model, obj) {
		const tensor0 = getConstNodeName(model, 0)
		const tensor1 = getConstNodeName(model, 1)
		const tensor_a = new onnx.TensorProto()
		tensor_a.setName(obj.name + '_a')
		tensor_a.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_a.setDimsList([1])
		tensor_a.setFloatDataList([obj.a ?? 0.25])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_tanh = new onnx.NodeProto()
		node_tanh.setOpType('Tanh')
		node_tanh.addInput(input)
		node_tanh.addOutput(obj.name + '_tanh')

		const node_less = new onnx.NodeProto()
		node_less.setOpType('Less')
		node_less.addInput(input)
		node_less.addInput(tensor0)
		node_less.addOutput(obj.name + '_less')

		const node_where = new onnx.NodeProto()
		node_where.setOpType('Where')
		node_where.addInput(obj.name + '_less')
		node_where.addInput(obj.name + '_a')
		node_where.addInput(tensor1)
		node_where.addOutput(obj.name + '_where')

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(obj.name + '_tanh')
		node_mul.addInput(obj.name + '_where')
		node_mul.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_a)
		graph.addNode(node_tanh)
		graph.addNode(node_less)
		graph.addNode(node_where)
		graph.addNode(node_mul)
	},
}
