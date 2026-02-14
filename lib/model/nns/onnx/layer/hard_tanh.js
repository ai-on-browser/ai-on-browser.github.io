import { onnx } from '../onnx_exporter.js'

/**
 * Handle hard tanh layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'hard_tanh'}} obj Node object
	 */
	export(model, obj) {
		const tensor_v = new onnx.TensorProto()
		tensor_v.setName(`${obj.name}_v`)
		tensor_v.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_v.setDimsList([1])
		tensor_v.setFloatDataList([obj.v ?? 1])

		const node_neg = new onnx.NodeProto()
		node_neg.setOpType('Neg')
		node_neg.addInput(`${obj.name}_v`)
		node_neg.addOutput(`${obj.name}_v_neg`)

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node = new onnx.NodeProto()
		node.setOpType('Clip')
		node.addInput(input)
		node.addInput(`${obj.name}_v_neg`)
		node.addInput(`${obj.name}_v`)
		node.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_v)
		graph.addNode(node_neg)
		graph.addNode(node)
	},
}
