import { onnx } from '../onnx_exporter.js'

/**
 * Handle sigmoid layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'sigmoid'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_sigmoid = new onnx.NodeProto()
		node_sigmoid.setOpType('Sigmoid')
		node_sigmoid.addInput(input)
		node_sigmoid.addOutput(`${obj.name}_sigmoid`)

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(input)
		node_mul.addInput(`${obj.name}_sigmoid`)
		node_mul.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_sigmoid)
		graph.addNode(node_mul)
	},
}
