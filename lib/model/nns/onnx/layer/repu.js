import { onnx } from '../onnx_exporter.js'

/**
 * Handle repu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'repu'}} obj Node object
	 */
	export(model, obj) {
		const tensor_s = new onnx.TensorProto()
		tensor_s.setName(`${obj.name}_s`)
		tensor_s.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_s.setDimsList([1])
		tensor_s.setFloatDataList([obj.s ?? 2])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_relu = new onnx.NodeProto()
		node_relu.setOpType('Relu')
		node_relu.addInput(input)
		node_relu.addOutput(`${obj.name}_relu`)

		const node_pow = new onnx.NodeProto()
		node_pow.setOpType('Pow')
		node_pow.addInput(`${obj.name}_relu`)
		node_pow.addInput(`${obj.name}_s`)
		node_pow.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_s)
		graph.addNode(node_relu)
		graph.addNode(node_pow)
	},
}
