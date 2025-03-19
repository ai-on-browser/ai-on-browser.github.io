import { onnx } from '../onnx_exporter.js'

/**
 * Handle swish layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'swish'}} obj Node object
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

		const node_sigmoid = new onnx.NodeProto()
		node_sigmoid.setOpType('Sigmoid')
		node_sigmoid.addInput(obj.name + '_mul')
		node_sigmoid.addOutput(obj.name + '_sigmoid')

		const node_muls = new onnx.NodeProto()
		node_muls.setOpType('Mul')
		node_muls.addInput(input)
		node_muls.addInput(obj.name + '_sigmoid')
		node_muls.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_beta)
		graph.addNode(node_mul)
		graph.addNode(node_sigmoid)
		graph.addNode(node_muls)
	},
}
