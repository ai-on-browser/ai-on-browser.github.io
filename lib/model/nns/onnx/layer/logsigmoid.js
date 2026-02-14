import { onnx } from '../onnx_exporter.js'

/**
 * Handle logsigmoid layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'logsigmoid'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_sigmoid = new onnx.NodeProto()
		node_sigmoid.setOpType('Sigmoid')
		node_sigmoid.addInput(input)
		node_sigmoid.addOutput(`${obj.name}_sigmoid`)

		const node_log = new onnx.NodeProto()
		node_log.setOpType('Log')
		node_log.addInput(`${obj.name}_sigmoid`)
		node_log.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_sigmoid)
		graph.addNode(node_log)
	},
}
