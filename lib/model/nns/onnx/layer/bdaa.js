import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle bdaa layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'bdaa'}} obj Node object
	 */
	export(model, obj) {
		const tensor1 = getConstNodeName(model, 1)
		const tensor2 = getConstNodeName(model, 2)

		const tensor_alpha = new onnx.TensorProto()
		tensor_alpha.setName(obj.name + '_alpha')
		tensor_alpha.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_alpha.setDimsList([1])
		tensor_alpha.setFloatDataList([obj.alpha ?? 1])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_neg = new onnx.NodeProto()
		node_neg.setOpType('Neg')
		node_neg.addInput(input)
		node_neg.addOutput(obj.name + '_neg')

		const node_neg_exp = new onnx.NodeProto()
		node_neg_exp.setOpType('Exp')
		node_neg_exp.addInput(obj.name + '_neg')
		node_neg_exp.addOutput(obj.name + '_neg_exp')

		const node_neg_exp_add1 = new onnx.NodeProto()
		node_neg_exp_add1.setOpType('Add')
		node_neg_exp_add1.addInput(tensor1)
		node_neg_exp_add1.addInput(obj.name + '_neg_exp')
		node_neg_exp_add1.addOutput(obj.name + '_neg_exp_add1')

		const node_term1 = new onnx.NodeProto()
		node_term1.setOpType('Reciprocal')
		node_term1.addInput(obj.name + '_neg_exp_add1')
		node_term1.addOutput(obj.name + '_term1')

		const node_neg_sub = new onnx.NodeProto()
		node_neg_sub.setOpType('Sub')
		node_neg_sub.addInput(obj.name + '_neg')
		node_neg_sub.addInput(obj.name + '_alpha')
		node_neg_sub.addOutput(obj.name + '_neg_sub')

		const node_neg_sub_exp = new onnx.NodeProto()
		node_neg_sub_exp.setOpType('Exp')
		node_neg_sub_exp.addInput(obj.name + '_neg_sub')
		node_neg_sub_exp.addOutput(obj.name + '_neg_sub_exp')

		const node_neg_sub_exp_add1 = new onnx.NodeProto()
		node_neg_sub_exp_add1.setOpType('Add')
		node_neg_sub_exp_add1.addInput(tensor1)
		node_neg_sub_exp_add1.addInput(obj.name + '_neg_sub_exp')
		node_neg_sub_exp_add1.addOutput(obj.name + '_neg_sub_exp_add1')

		const node_term2 = new onnx.NodeProto()
		node_term2.setOpType('Reciprocal')
		node_term2.addInput(obj.name + '_neg_sub_exp_add1')
		node_term2.addOutput(obj.name + '_term2')

		const node_sub = new onnx.NodeProto()
		node_sub.setOpType('Sub')
		node_sub.addInput(obj.name + '_term1')
		node_sub.addInput(obj.name + '_term2')
		node_sub.addOutput(obj.name + '_sub')

		const node_div = new onnx.NodeProto()
		node_div.setOpType('Div')
		node_div.addInput(obj.name + '_sub')
		node_div.addInput(tensor2)
		node_div.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_alpha)
		graph.addNode(node_neg)
		graph.addNode(node_neg_exp)
		graph.addNode(node_neg_exp_add1)
		graph.addNode(node_term1)
		graph.addNode(node_neg_sub)
		graph.addNode(node_neg_sub_exp)
		graph.addNode(node_neg_sub_exp_add1)
		graph.addNode(node_term2)
		graph.addNode(node_sub)
		graph.addNode(node_div)
	},
}
