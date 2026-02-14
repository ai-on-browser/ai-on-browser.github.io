import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle ptelu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'ptelu'}} obj Node object
	 */
	export(model, obj) {
		const tensor0 = getConstNodeName(model, 0)
		const tensor_alpha = new onnx.TensorProto()
		tensor_alpha.setName(`${obj.name}_alpha`)
		tensor_alpha.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_alpha.setDimsList([1])
		tensor_alpha.setFloatDataList([obj.alpha ?? 1])
		const tensor_beta = new onnx.TensorProto()
		tensor_beta.setName(`${obj.name}_beta`)
		tensor_beta.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_beta.setDimsList([1])
		tensor_beta.setFloatDataList([obj.beta ?? 1])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_mul_b = new onnx.NodeProto()
		node_mul_b.setOpType('Mul')
		node_mul_b.addInput(input)
		node_mul_b.addInput(`${obj.name}_beta`)
		node_mul_b.addOutput(`${obj.name}_mul_b`)

		const node_tanh = new onnx.NodeProto()
		node_tanh.setOpType('Tanh')
		node_tanh.addInput(`${obj.name}_mul_b`)
		node_tanh.addOutput(`${obj.name}_tanh`)

		const node_mul_a = new onnx.NodeProto()
		node_mul_a.setOpType('Mul')
		node_mul_a.addInput(`${obj.name}_tanh`)
		node_mul_a.addInput(`${obj.name}_alpha`)
		node_mul_a.addOutput(`${obj.name}_mul_a`)

		const node_greater = new onnx.NodeProto()
		node_greater.setOpType('Greater')
		node_greater.addInput(input)
		node_greater.addInput(tensor0)
		node_greater.addOutput(`${obj.name}_greater`)

		const node_where = new onnx.NodeProto()
		node_where.setOpType('Where')
		node_where.addInput(`${obj.name}_greater`)
		node_where.addInput(input)
		node_where.addInput(`${obj.name}_mul_a`)
		node_where.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_alpha)
		graph.addInitializer(tensor_beta)
		graph.addNode(node_mul_b)
		graph.addNode(node_tanh)
		graph.addNode(node_mul_a)
		graph.addNode(node_greater)
		graph.addNode(node_where)
	},
}
