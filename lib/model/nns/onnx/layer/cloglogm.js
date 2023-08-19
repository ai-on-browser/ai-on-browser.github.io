import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle cloglog layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'cloglog'}} obj Node object
	 */
	export(model, obj) {
		const tensor1 = getConstNodeName(model, 1)
		const tensor2 = getConstNodeName(model, 2)
		const tensor07 = getConstNodeName(model, -0.7)

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_exp = new onnx.NodeProto()
		node_exp.setOpType('Exp')
		node_exp.addInput(input)
		node_exp.addOutput(obj.name + '_exp')

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(tensor07)
		node_mul.addInput(obj.name + '_exp')
		node_mul.addOutput(obj.name + '_mul')

		const node_exp2 = new onnx.NodeProto()
		node_exp2.setOpType('Exp')
		node_exp2.addInput(obj.name + '_mul')
		node_exp2.addOutput(obj.name + '_exp2')

		const node_mul2 = new onnx.NodeProto()
		node_mul2.setOpType('Mul')
		node_mul2.addInput(tensor2)
		node_mul2.addInput(obj.name + '_exp2')
		node_mul2.addOutput(obj.name + '_mul2')

		const node_sub = new onnx.NodeProto()
		node_sub.setOpType('Sub')
		node_sub.addInput(tensor1)
		node_sub.addInput(obj.name + '_mul2')
		node_sub.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_exp)
		graph.addNode(node_mul)
		graph.addNode(node_exp2)
		graph.addNode(node_mul2)
		graph.addNode(node_sub)
	},
}
