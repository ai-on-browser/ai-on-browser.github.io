import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle gaussian layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'gaussian'}} obj Node object
	 */
	export(model, obj) {
		const tensor2 = getConstNodeName(model, 2)

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_pow = new onnx.NodeProto()
		node_pow.setOpType('Pow')
		node_pow.addInput(input)
		node_pow.addInput(tensor2)
		node_pow.addOutput(`${obj.name}_pow`)

		const node_neg = new onnx.NodeProto()
		node_neg.setOpType('Neg')
		node_neg.addInput(`${obj.name}_pow`)
		node_neg.addOutput(`${obj.name}_neg`)

		const node_div = new onnx.NodeProto()
		node_div.setOpType('Div')
		node_div.addInput(`${obj.name}_neg`)
		node_div.addInput(tensor2)
		node_div.addOutput(`${obj.name}_div`)

		const node_exp = new onnx.NodeProto()
		node_exp.setOpType('Exp')
		node_exp.addInput(`${obj.name}_div`)
		node_exp.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_pow)
		graph.addNode(node_neg)
		graph.addNode(node_div)
		graph.addNode(node_exp)
	},
}
