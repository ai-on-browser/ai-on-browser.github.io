import { onnx } from '../onnx_exporter.js'

/**
 * Handle tanhexp layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'tanhexp'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_exp = new onnx.NodeProto()
		node_exp.setOpType('Exp')
		node_exp.addInput(input)
		node_exp.addOutput(`${obj.name}_exp`)

		const node_tanh = new onnx.NodeProto()
		node_tanh.setOpType('Tanh')
		node_tanh.addInput(`${obj.name}_exp`)
		node_tanh.addOutput(`${obj.name}_tanh`)

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(`${obj.name}_tanh`)
		node_mul.addInput(input)
		node_mul.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_exp)
		graph.addNode(node_tanh)
		graph.addNode(node_mul)
	},
}
