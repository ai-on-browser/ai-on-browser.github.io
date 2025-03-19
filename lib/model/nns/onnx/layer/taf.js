import { onnx } from '../onnx_exporter.js'

/**
 * Handle taf layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'taf'}} obj Node object
	 */
	export(model, obj) {
		const tensor_a = new onnx.TensorProto()
		tensor_a.setName(obj.name + '_a')
		tensor_a.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_a.setDimsList([1])
		tensor_a.setFloatDataList([obj.a ?? 0])
		const tensor_b = new onnx.TensorProto()
		tensor_b.setName(obj.name + '_b')
		tensor_b.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_b.setDimsList([1])
		tensor_b.setFloatDataList([obj.b ?? 0])

		const node_bb = new onnx.NodeProto()
		node_bb.setOpType('Mul')
		node_bb.addInput(obj.name + '_b')
		node_bb.addInput(obj.name + '_b')
		node_bb.addOutput(obj.name + '_bb')

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_sub = new onnx.NodeProto()
		node_sub.setOpType('Sub')
		node_sub.addInput(input)
		node_sub.addInput(obj.name + '_a')
		node_sub.addOutput(obj.name + '_sub')

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(obj.name + '_sub')
		node_mul.addInput(obj.name + '_sub')
		node_mul.addOutput(obj.name + '_mul')

		const node_add = new onnx.NodeProto()
		node_add.setOpType('Add')
		node_add.addInput(obj.name + '_mul')
		node_add.addInput(obj.name + '_bb')
		node_add.addOutput(obj.name + '_add')

		const node_sqrt = new onnx.NodeProto()
		node_sqrt.setOpType('Sqrt')
		node_sqrt.addInput(obj.name + '_add')
		node_sqrt.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_a)
		graph.addInitializer(tensor_b)
		graph.addNode(node_bb)
		graph.addNode(node_sub)
		graph.addNode(node_mul)
		graph.addNode(node_add)
		graph.addNode(node_sqrt)
	},
}
