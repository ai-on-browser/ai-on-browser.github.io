import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle elliott layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'elliott'}} obj Node object
	 */
	export(model, obj) {
		const tensor1 = getConstNodeName(model, 1)
		const tensor2 = getConstNodeName(model, 2)

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_softsign = new onnx.NodeProto()
		node_softsign.setOpType('Softsign')
		node_softsign.addInput(input)
		node_softsign.addOutput(obj.name + '_softsign')

		const node_add = new onnx.NodeProto()
		node_add.setOpType('Add')
		node_add.addInput(obj.name + '_softsign')
		node_add.addInput(tensor1)
		node_add.addOutput(obj.name + '_div')

		const node_div = new onnx.NodeProto()
		node_div.setOpType('Div')
		node_div.addInput(obj.name + '_div')
		node_div.addInput(tensor2)
		node_div.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_softsign)
		graph.addNode(node_add)
		graph.addNode(node_div)
	},
}
