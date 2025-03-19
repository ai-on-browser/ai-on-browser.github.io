import { onnx } from '../onnx_exporter.js'

/**
 * Handle resech layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'resech'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_cosh = new onnx.NodeProto()
		node_cosh.setOpType('Cosh')
		node_cosh.addInput(input)
		node_cosh.addOutput(obj.name + '_cosh')

		const node_div = new onnx.NodeProto()
		node_div.setOpType('Div')
		node_div.addInput(input)
		node_div.addInput(obj.name + '_cosh')
		node_div.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_cosh)
		graph.addNode(node_div)
	},
}
