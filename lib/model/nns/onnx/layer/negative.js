import { onnx } from '../onnx_exporter.js'

/**
 * Handle negative layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'negative'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node = new onnx.NodeProto()
		node.setOpType('Neg')
		node.addInput(input)
		node.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node)
	},
}
