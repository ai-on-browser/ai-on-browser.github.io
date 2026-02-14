import { onnx } from '../onnx_exporter.js'

/**
 * Handle div layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'div'}} obj Node object
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
		} else if (obj.input.length === 2) {
			node.setOpType('Div')
			node.addInput(obj.input[0])
			node.addInput(obj.input[1])
		} else {
			let prev_in = obj.input[1]
			for (let i = 2; i < obj.input.length; i++) {
				const node_mul = new onnx.NodeProto()
				node_mul.setOpType('Mul')
				node_mul.addInput(prev_in)
				node_mul.addInput(obj.input[i])
				node_mul.addOutput((prev_in = `${obj.name}_mul_${i - 2}`))
				graph.addNode(node_mul)
			}

			node.setOpType('Div')
			node.addInput(obj.input[0])
			node.addInput(prev_in)
		}
		node.addOutput(obj.name)
		graph.addNode(node)
	},
}
