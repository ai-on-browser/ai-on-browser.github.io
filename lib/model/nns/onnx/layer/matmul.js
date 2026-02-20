import { onnx } from '../onnx_exporter.js'

/**
 * Handle matmul layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'matmul'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj, info) {
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
				const node_matmul = new onnx.NodeProto()
				node_matmul.setOpType('MatMul')
				node_matmul.addInput(prev_in)
				node_matmul.addInput(obj.input[i])
				prev_in = `${obj.name}_matmul_${i - 1}`
				node_matmul.addOutput(prev_in)
				graph.addNode(node_matmul)
			}

			node.setOpType('MatMul')
			node.addInput(prev_in)
			node.addInput(obj.input.at(-1))
		}
		node.addOutput(obj.name)
		graph.addNode(node)

		const size = info[obj.input[0]].size.concat()
		size[size.length - 1] = info[obj.input.at(-1)].size.at(-1)
		return { size }
	},
}
