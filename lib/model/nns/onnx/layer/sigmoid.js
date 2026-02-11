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
		const tensor_a = new onnx.TensorProto()
		tensor_a.setName(`${obj.name}_a`)
		tensor_a.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_a.setDimsList([1])
		tensor_a.setFloatDataList([obj.a ?? 1])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(input)
		node_mul.addInput(`${obj.name}_a`)
		node_mul.addOutput(`${obj.name}_mul`)

		const node_sigmoid = new onnx.NodeProto()
		node_sigmoid.setOpType('Sigmoid')
		node_sigmoid.addInput(`${obj.name}_mul`)
		node_sigmoid.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_a)
		graph.addNode(node_mul)
		graph.addNode(node_sigmoid)
	},
}
