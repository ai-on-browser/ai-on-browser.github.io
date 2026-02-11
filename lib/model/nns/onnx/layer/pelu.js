import { onnx } from '../onnx_exporter.js'

/**
 * Handle pelu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'pelu'}} obj Node object
	 */
	export(model, obj) {
		const tensor_a = new onnx.TensorProto()
		tensor_a.setName(`${obj.name}_a`)
		tensor_a.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_a.setDimsList([1])
		tensor_a.setFloatDataList([obj.a ?? 1])
		const tensor_b = new onnx.TensorProto()
		tensor_b.setName(`${obj.name}_b`)
		tensor_b.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_b.setDimsList([1])
		tensor_b.setFloatDataList([obj.b ?? 1])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_div = new onnx.NodeProto()
		node_div.setOpType('Div')
		node_div.addInput(input)
		node_div.addInput(`${obj.name}_b`)
		node_div.addOutput(`${obj.name}_div`)

		const node_elu = new onnx.NodeProto()
		node_elu.setOpType('Elu')
		node_elu.addInput(`${obj.name}_div`)
		node_elu.addOutput(`${obj.name}_elu`)

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(`${obj.name}_elu`)
		node_mul.addInput(`${obj.name}_a`)
		node_mul.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_a)
		graph.addInitializer(tensor_b)
		graph.addNode(node_div)
		graph.addNode(node_elu)
		graph.addNode(node_mul)
	},
}
