import { onnx } from '../onnx_exporter.js'

/**
 * Handle srelu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'srelu'}} obj Node object
	 */
	export(model, obj) {
		const tensor_d = new onnx.TensorProto()
		tensor_d.setName(obj.name + '_d')
		tensor_d.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_d.setDimsList([1])
		tensor_d.setFloatDataList([obj.d ?? 0])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node = new onnx.NodeProto()
		node.setOpType('Max')
		node.addInput(input)
		node.addInput(obj.name + '_d')
		node.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_d)
		graph.addNode(node)
	},
}
