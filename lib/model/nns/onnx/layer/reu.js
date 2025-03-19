import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle reu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'reu'}} obj Node object
	 */
	export(model, obj) {
		const tensor1 = getConstNodeName(model, 1)
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_exp = new onnx.NodeProto()
		node_exp.setOpType('Exp')
		node_exp.addInput(input)
		node_exp.addOutput(obj.name + '_exp')

		const node_min = new onnx.NodeProto()
		node_min.setOpType('Min')
		node_min.addInput(tensor1)
		node_min.addInput(obj.name + '_exp')
		node_min.addOutput(obj.name + '_min')

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(input)
		node_mul.addInput(obj.name + '_min')
		node_mul.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_exp)
		graph.addNode(node_min)
		graph.addNode(node_mul)
	},
}
