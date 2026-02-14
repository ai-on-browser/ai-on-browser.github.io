import { onnx } from '../onnx_exporter.js'

/**
 * Handle prelu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'prelu'}} obj Node object
	 */
	export(model, obj) {
		const graph = model.getGraph()
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node = new onnx.NodeProto()
		node.setOpType('PRelu')
		node.addInput(input)
		node.addOutput(obj.name)

		if (typeof obj.a === 'string') {
			node.addInput(obj.a)
		} else {
			const a = Array.isArray(obj.a) ? obj.a : [obj.a ?? 0.25]
			const tensor_a0 = new onnx.TensorProto()
			tensor_a0.setName(`${obj.name}_a`)
			tensor_a0.setDataType(onnx.TensorProto.DataType.FLOAT)
			tensor_a0.setDimsList([a.length])
			tensor_a0.setFloatDataList(a)

			node.addInput(`${obj.name}_a`)
			graph.addInitializer(tensor_a0)
		}

		graph.addNode(node)
	},
}
