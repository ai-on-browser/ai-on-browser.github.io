import { onnx } from '../onnx_exporter.js'

/**
 * Handle loglog layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'loglog'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_neg1 = new onnx.NodeProto()
		node_neg1.setOpType('Neg')
		node_neg1.addInput(input)
		node_neg1.addOutput(obj.name + '_neg1')

		const node_exp = new onnx.NodeProto()
		node_exp.setOpType('Exp')
		node_exp.addInput(obj.name + '_neg1')
		node_exp.addOutput(obj.name + '_exp')

		const node_neg = new onnx.NodeProto()
		node_neg.setOpType('Neg')
		node_neg.addInput(obj.name + '_exp')
		node_neg.addOutput(obj.name + '_neg')

		const node_exp2 = new onnx.NodeProto()
		node_exp2.setOpType('Exp')
		node_exp2.addInput(obj.name + '_neg')
		node_exp2.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_neg1)
		graph.addNode(node_exp)
		graph.addNode(node_neg)
		graph.addNode(node_exp2)
	},
}
