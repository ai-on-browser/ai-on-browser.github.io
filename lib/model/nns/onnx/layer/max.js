import { onnx } from '../onnx_exporter.js'

/**
 * Handle max layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'max'}} obj Node object
	 */
	export(model, obj) {
		if (!Array.isArray(obj.input)) {
			throw new Error(`Invalid attribute 'input' value ${obj.input}.`)
		}
		const node = new onnx.NodeProto()
		node.setOpType('Max')
		for (const i of obj.input) {
			node.addInput(i)
		}
		node.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node)
	},
}
