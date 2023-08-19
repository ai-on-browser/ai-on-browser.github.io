import { onnx } from '../onnx_exporter.js'

/**
 * Handle slaf layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'slaf'}} obj Node object
	 */
	export(model, obj) {
		const n = obj.n ?? 3
		const a = Array.isArray(obj.a) ? obj.a : Array(n).fill(obj.a ?? 1)
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const graph = model.getGraph()

		const tensor_a0 = new onnx.TensorProto()
		tensor_a0.setName(obj.name + '_a0')
		tensor_a0.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_a0.setDimsList([1])
		tensor_a0.setFloatDataList([a[0]])
		graph.addInitializer(tensor_a0)

		const node_sum = new onnx.NodeProto()
		node_sum.setOpType('Sum')
		node_sum.addInput(obj.name + '_a0')
		node_sum.addOutput(obj.name)

		let vprev = input
		for (let i = 1; i < n; i++) {
			const tensor_a = new onnx.TensorProto()
			tensor_a.setName(obj.name + `_a${i}`)
			tensor_a.setDataType(onnx.TensorProto.DataType.FLOAT)
			tensor_a.setDimsList([1])
			tensor_a.setFloatDataList([a[i]])
			graph.addInitializer(tensor_a)

			const node_term = new onnx.NodeProto()
			node_term.setOpType('Mul')
			if (i === 1) {
				node_term.addInput(input)
			} else {
				const node_mul = new onnx.NodeProto()
				node_mul.setOpType('Mul')
				node_mul.addInput(input)
				node_mul.addInput(vprev)
				node_mul.addOutput(obj.name + `_pow${i}`)
				vprev = obj.name + `_pow${i}`

				node_term.addInput(obj.name + `_pow${i}`)
				graph.addNode(node_mul)
			}
			node_term.addInput(obj.name + `_a${i}`)
			node_term.addOutput(obj.name + `_${i}`)
			graph.addNode(node_term)
			node_sum.addInput(obj.name + `_${i}`)
		}

		graph.addNode(node_sum)
	},
}
