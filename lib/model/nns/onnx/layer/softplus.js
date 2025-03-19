import { onnx } from '../onnx_exporter.js'

/**
 * Handle softplus layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'softplus'}} obj Node object
	 */
	export(model, obj) {
		const tensor_beta = new onnx.TensorProto()
		tensor_beta.setName(obj.name + '_beta')
		tensor_beta.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_beta.setDimsList([1])
		tensor_beta.setFloatDataList([obj.beta ?? 1])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(input)
		node_mul.addInput(obj.name + '_beta')
		node_mul.addOutput(obj.name + '_mul')

		const node_softplus = new onnx.NodeProto()
		node_softplus.setOpType('Softplus')
		node_softplus.addInput(obj.name + '_mul')
		node_softplus.addOutput(obj.name + '_softplus')

		const node_div = new onnx.NodeProto()
		node_div.setOpType('Div')
		node_div.addInput(obj.name + '_softplus')
		node_div.addInput(obj.name + '_beta')
		node_div.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_beta)
		graph.addNode(node_mul)
		graph.addNode(node_softplus)
		graph.addNode(node_div)
	},
}
