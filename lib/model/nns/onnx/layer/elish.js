import { onnx } from '../onnx_exporter.js'

/**
 * Handle elish layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'elish'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_elu = new onnx.NodeProto()
		node_elu.setOpType('Elu')
		node_elu.addInput(input)
		node_elu.addOutput(`${obj.name}_elu`)

		const node_sigm = new onnx.NodeProto()
		node_sigm.setOpType('Sigmoid')
		node_sigm.addInput(input)
		node_sigm.addOutput(`${obj.name}_sigm`)

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(`${obj.name}_elu`)
		node_mul.addInput(`${obj.name}_sigm`)
		node_mul.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_elu)
		graph.addNode(node_sigm)
		graph.addNode(node_mul)
	},
}
