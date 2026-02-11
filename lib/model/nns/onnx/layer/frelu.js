import { onnx } from '../onnx_exporter.js'

/**
 * Handle frelu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'frelu'}} obj Node object
	 */
	export(model, obj) {
		const tensor_b = new onnx.TensorProto()
		tensor_b.setName(`${obj.name}_b`)
		tensor_b.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_b.setDimsList([1])
		tensor_b.setFloatDataList([obj.b ?? 0])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_relu = new onnx.NodeProto()
		node_relu.setOpType('Relu')
		node_relu.addInput(input)
		node_relu.addOutput(`${obj.name}_relu`)

		const node_add = new onnx.NodeProto()
		node_add.setOpType('Add')
		node_add.addInput(`${obj.name}_relu`)
		node_add.addInput(`${obj.name}_b`)
		node_add.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_b)
		graph.addNode(node_relu)
		graph.addNode(node_add)
	},
}
