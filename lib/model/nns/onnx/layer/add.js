import { onnx } from '../onnx_exporter.js'

/**
 * Handle add layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'add'}} obj Node object
	 */
	export(model, obj) {
		if (!Array.isArray(obj.input)) {
			throw new Error(`Invalid attribute 'input' value ${obj.input}.`)
		}
		const node = new onnx.NodeProto()
		node.setOpType(obj.input.length === 2 ? 'Add' : 'Sum')
		for (const i of obj.input) {
			node.addInput(i)
		}
		node.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node)
	},
}
