import { onnx } from '../onnx_exporter.js'

/**
 * Handle sub layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'sub'}} obj Node object
	 */
	export(model, obj) {
		if (!Array.isArray(obj.input)) {
			throw new Error(`Invalid attribute 'input' value ${obj.input}.`)
		}
		const graph = model.getGraph()
		const node = new onnx.NodeProto()
		if (obj.input.length === 1) {
			node.setOpType('Identity')
			node.addInput(obj.input[0])
		} else {
			node.setOpType('Sub')
			node.addInput(obj.input[0])
			if (obj.input.length === 2) {
				node.addInput(obj.input[1])
			} else {
				const node_sum = new onnx.NodeProto()
				node_sum.setOpType('Sum')
				for (let i = 1; i < obj.input.length; i++) {
					node_sum.addInput(obj.input[i])
				}
				node_sum.addOutput(`${obj.name}_sum`)
				graph.addNode(node_sum)
				node.addInput(`${obj.name}_sum`)
			}
		}
		node.addOutput(obj.name)
		graph.addNode(node)
	},
}
