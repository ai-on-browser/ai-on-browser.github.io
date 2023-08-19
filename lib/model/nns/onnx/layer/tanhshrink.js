import { onnx } from '../onnx_exporter.js'

/**
 * Handle tanhshrink layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'tanhshrink'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_tanh = new onnx.NodeProto()
		node_tanh.setOpType('Tanh')
		node_tanh.addInput(input)
		node_tanh.addOutput(obj.name + '_tanh')

		const node_sub = new onnx.NodeProto()
		node_sub.setOpType('Sub')
		node_sub.addInput(input)
		node_sub.addInput(obj.name + '_tanh')
		node_sub.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_tanh)
		graph.addNode(node_sub)
	},
}
