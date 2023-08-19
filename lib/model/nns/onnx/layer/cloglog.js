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

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_exp = new onnx.NodeProto()
		node_exp.setOpType('Exp')
		node_exp.addInput(input)
		node_exp.addOutput(obj.name + '_exp')

		const node_nev = new onnx.NodeProto()
		node_nev.setOpType('Neg')
		node_nev.addInput(obj.name + '_exp')
		node_nev.addOutput(obj.name + '_neg')

		const node_exp2 = new onnx.NodeProto()
		node_exp2.setOpType('Exp')
		node_exp2.addInput(obj.name + '_neg')
		node_exp2.addOutput(obj.name + '_exp2')

		const node_sub = new onnx.NodeProto()
		node_sub.setOpType('Sub')
		node_sub.addInput(tensor1)
		node_sub.addInput(obj.name + '_exp2')
		node_sub.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_exp)
		graph.addNode(node_nev)
		graph.addNode(node_exp2)
		graph.addNode(node_sub)
	},
}
