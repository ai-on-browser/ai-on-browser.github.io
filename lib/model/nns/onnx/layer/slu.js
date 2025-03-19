import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle slu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'slu'}} obj Node object
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
		const tensor_gamma = new onnx.TensorProto()
		tensor_gamma.setName(obj.name + '_gamma')
		tensor_gamma.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_gamma.setDimsList([1])
		tensor_gamma.setFloatDataList([obj.gamma ?? 0])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_softplus = new onnx.NodeProto()
		node_softplus.setOpType('Softplus')
		node_softplus.addInput(input)
		node_softplus.addOutput(obj.name + '_softplus')

		const node_mul_beta = new onnx.NodeProto()
		node_mul_beta.setOpType('Mul')
		node_mul_beta.addInput(obj.name + '_softplus')
		node_mul_beta.addInput(obj.name + '_beta')
		node_mul_beta.addOutput(obj.name + '_mul_beta')

		const node_sub = new onnx.NodeProto()
		node_sub.setOpType('Sub')
		node_sub.addInput(obj.name + '_mul_beta')
		node_sub.addInput(obj.name + '_gamma')
		node_sub.addOutput(obj.name + '_sub')

		const node_mul_alpha = new onnx.NodeProto()
		node_mul_alpha.setOpType('Mul')
		node_mul_alpha.addInput(input)
		node_mul_alpha.addInput(obj.name + '_alpha')
		node_mul_alpha.addOutput(obj.name + '_mul_alpha')

		const node_greater = new onnx.NodeProto()
		node_greater.setOpType('Greater')
		node_greater.addInput(input)
		node_greater.addInput(tensor0)
		node_greater.addOutput(obj.name + '_greater')

		const node_where = new onnx.NodeProto()
		node_where.setOpType('Where')
		node_where.addInput(obj.name + '_greater')
		node_where.addInput(obj.name + '_mul_alpha')
		node_where.addInput(obj.name + '_sub')
		node_where.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_alpha)
		graph.addInitializer(tensor_beta)
		graph.addInitializer(tensor_gamma)
		graph.addNode(node_softplus)
		graph.addNode(node_mul_beta)
		graph.addNode(node_sub)
		graph.addNode(node_mul_alpha)
		graph.addNode(node_greater)
		graph.addNode(node_where)
	},
}
