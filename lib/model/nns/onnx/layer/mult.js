import { onnx } from '../onnx_exporter.js'

/**
 * Handle mult layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'mult'}} obj Node object
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
			let prev_in = obj.input[0]
			for (let i = 1; i < obj.input.length - 1; i++) {
				const node_mul = new onnx.NodeProto()
				node_mul.setOpType('Mul')
				node_mul.addInput(prev_in)
				node_mul.addInput(obj.input[i])
				node_mul.addOutput((prev_in = `${obj.name}_mul_${i - 1}`))
				graph.addNode(node_mul)
			}

			node.setOpType('Mul')
			node.addInput(prev_in)
			node.addInput(obj.input.at(-1))
		}
		node.addOutput(obj.name)
		graph.addNode(node)
	},
}
