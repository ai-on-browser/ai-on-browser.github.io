import { onnx } from '../onnx_exporter.js'

/**
 * Handle clip layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'clip'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node = new onnx.NodeProto()
		node.setOpType('Clip')
		node.addInput(input)
		node.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node)

		if (typeof obj.min === 'string') {
			node.addInput(obj.min)
		} else if (obj.min != null) {
			const tensor_min = new onnx.TensorProto()
			tensor_min.setName(`${obj.name}_min`)
			tensor_min.setDataType(onnx.TensorProto.DataType.FLOAT)
			tensor_min.setDimsList([1])
			tensor_min.setFloatDataList([obj.min])
			node.addInput(`${obj.name}_min`)
			graph.addInitializer(tensor_min)
		}

		if (typeof obj.max === 'string') {
			node.addInput(obj.max)
		} else if (obj.max != null) {
			const tensor_max = new onnx.TensorProto()
			tensor_max.setName(`${obj.name}_max`)
			tensor_max.setDataType(onnx.TensorProto.DataType.FLOAT)
			tensor_max.setDimsList([1])
			tensor_max.setFloatDataList([obj.max])
			if (obj.min == null) {
				node.addInput('')
			}
			node.addInput(`${obj.name}_max`)
			graph.addInitializer(tensor_max)
		}
	},
}
