import { onnx } from '../onnx_exporter.js'

/**
 * Handle psf layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'psf'}} obj Node object
	 */
	export(model, obj) {
		const tensor_m = new onnx.TensorProto()
		tensor_m.setName(obj.name + '_m')
		tensor_m.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_m.setDimsList([1])
		tensor_m.setFloatDataList([obj.m ?? 2])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_sigmoid = new onnx.NodeProto()
		node_sigmoid.setOpType('Sigmoid')
		node_sigmoid.addInput(input)
		node_sigmoid.addOutput(obj.name + '_sigmoid')

		const node_pow = new onnx.NodeProto()
		node_pow.setOpType('Pow')
		node_pow.addInput(obj.name + '_sigmoid')
		node_pow.addInput(obj.name + '_m')
		node_pow.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_m)
		graph.addNode(node_sigmoid)
		graph.addNode(node_pow)
	},
}
