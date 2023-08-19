import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle preu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'preu'}} obj Node object
	 */
	export(model, obj) {
		const tensor0 = getConstNodeName(model, 0)
		const tensor_alpha = new onnx.TensorProto()
		tensor_alpha.setName(obj.name + '_alpha')
		tensor_alpha.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_alpha.setDimsList([1])
		tensor_alpha.setFloatDataList([obj.alpha ?? 1])
		const tensor_beta = new onnx.TensorProto()
		tensor_beta.setName(obj.name + '_beta')
		tensor_beta.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_beta.setDimsList([1])
		tensor_beta.setFloatDataList([obj.beta ?? 1])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_min = new onnx.NodeProto()
		node_min.setOpType('Min')
		node_min.addInput(input)
		node_min.addInput(tensor0)
		node_min.addOutput(obj.name + '_min')

		const node_mul_b = new onnx.NodeProto()
		node_mul_b.setOpType('Mul')
		node_mul_b.addInput(obj.name + '_min')
		node_mul_b.addInput(obj.name + '_beta')
		node_mul_b.addOutput(obj.name + '_mul_b')

		const node_exp = new onnx.NodeProto()
		node_exp.setOpType('Exp')
		node_exp.addInput(obj.name + '_mul_b')
		node_exp.addOutput(obj.name + '_exp')

		const node_mul_a = new onnx.NodeProto()
		node_mul_a.setOpType('Mul')
		node_mul_a.addInput(input)
		node_mul_a.addInput(obj.name + '_alpha')
		node_mul_a.addOutput(obj.name + '_mul_a')

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(obj.name + '_mul_a')
		node_mul.addInput(obj.name + '_exp')
		node_mul.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_alpha)
		graph.addInitializer(tensor_beta)
		graph.addNode(node_min)
		graph.addNode(node_mul_b)
		graph.addNode(node_exp)
		graph.addNode(node_mul_a)
		graph.addNode(node_mul)
	},
}
