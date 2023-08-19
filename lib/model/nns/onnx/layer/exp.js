import { onnx } from '../onnx_exporter.js'

/**
 * Handle exp layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'exp'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node = new onnx.NodeProto()
		node.setOpType('Exp')
		node.addInput(input)
		node.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node)
	},
}
