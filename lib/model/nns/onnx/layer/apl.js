import { onnx } from '../onnx_exporter.js'

/**
 * Handle apl layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'apl'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_base = new onnx.NodeProto()
		node_base.setOpType('Relu')
		node_base.addInput(input)
		node_base.addOutput(`${obj.name}_base`)

		const graph = model.getGraph()
		graph.addNode(node_base)

		const node_add = new onnx.NodeProto()
		node_add.setOpType('Sum')
		node_add.addInput(`${obj.name}_base`)

		const s = obj.s ?? 2
		const a = Array.isArray(obj.a) ? obj.a : Array(s).fill(obj.a ?? 0.1)
		const b = Array.isArray(obj.b) ? obj.b : Array(s).fill(obj.b ?? 0)
		for (let i = 0; i < s; i++) {
			const tensor_a = new onnx.TensorProto()
			tensor_a.setName(`${obj.name}_a_${i}`)
			tensor_a.setDataType(onnx.TensorProto.DataType.FLOAT)
			tensor_a.setDimsList([1])
			tensor_a.setFloatDataList([a[i]])

			const tensor_b = new onnx.TensorProto()
			tensor_b.setName(`${obj.name}_b_${i}`)
			tensor_b.setDataType(onnx.TensorProto.DataType.FLOAT)
			tensor_b.setDimsList([1])
			tensor_b.setFloatDataList([b[i]])

			const node_sub = new onnx.NodeProto()
			node_sub.setOpType('Sub')
			node_sub.addInput(`${obj.name}_b_${i}`)
			node_sub.addInput(input)
			node_sub.addOutput(`${obj.name}_sub_${i}`)

			const node_relu = new onnx.NodeProto()
			node_relu.setOpType('Relu')
			node_relu.addInput(`${obj.name}_sub_${i}`)
			node_relu.addOutput(`${obj.name}_relu_${i}`)

			const node_mult = new onnx.NodeProto()
			node_mult.setOpType('Mul')
			node_mult.addInput(`${obj.name}_relu_${i}`)
			node_mult.addInput(`${obj.name}_a_${i}`)
			node_mult.addOutput(`${obj.name}_mul_${i}`)

			node_add.addInput(`${obj.name}_mul_${i}`)

			graph.addInitializer(tensor_a)
			graph.addInitializer(tensor_b)
			graph.addNode(node_sub)
			graph.addNode(node_relu)
			graph.addNode(node_mult)
		}

		node_add.addOutput(obj.name)
		graph.addNode(node_add)
	},
}
