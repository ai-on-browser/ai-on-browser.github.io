import { onnx } from '../onnx_exporter.js'

/**
 * Handle eswish layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'eswish'}} obj Node object
	 */
	export(model, obj) {
		const tensor_beta = new onnx.TensorProto()
		tensor_beta.setName(obj.name + '_beta')
		tensor_beta.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_beta.setDimsList([1])
		tensor_beta.setFloatDataList([obj.beta ?? 1])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_sigm = new onnx.NodeProto()
		node_sigm.setOpType('Sigmoid')
		node_sigm.addInput(input)
		node_sigm.addOutput(obj.name + '_sigm')

		const node_mul1 = new onnx.NodeProto()
		node_mul1.setOpType('Mul')
		node_mul1.addInput(input)
		node_mul1.addInput(obj.name + '_sigm')
		node_mul1.addOutput(obj.name + '_mul')

		const node_mul2 = new onnx.NodeProto()
		node_mul2.setOpType('Mul')
		node_mul2.addInput(obj.name + '_beta')
		node_mul2.addInput(obj.name + '_mul')
		node_mul2.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_beta)
		graph.addNode(node_sigm)
		graph.addNode(node_mul1)
		graph.addNode(node_mul2)
	},
}
