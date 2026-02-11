import { onnx } from '../onnx_exporter.js'

/**
 * Handle lisht layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'lisht'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_tanh = new onnx.NodeProto()
		node_tanh.setOpType('Tanh')
		node_tanh.addInput(input)
		node_tanh.addOutput(`${obj.name}_tanh`)

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(`${obj.name}_tanh`)
		node_mul.addInput(input)
		node_mul.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_tanh)
		graph.addNode(node_mul)
	},
}
