import { onnx } from '../onnx_exporter.js'

/**
 * Handle reshape layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'reshape'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj, info) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const inSize = info[input].size
		const outSize = typeof obj.size === 'string' ? info[obj.size].size : obj.size
		if (outSize.length === 1 || inSize.slice(1).reduce((p, v) => p * v, 1) === outSize.reduce((p, v) => p * v, 1)) {
			outSize.unshift(inSize[0])
		}
		const tensor_shape = new onnx.TensorProto()
		tensor_shape.setName(`${obj.name}_shape`)
		tensor_shape.setDataType(onnx.TensorProto.DataType.INT64)
		tensor_shape.setDimsList([outSize.length])
		tensor_shape.setInt64DataList(outSize.map(v => v ?? -1))

		const node = new onnx.NodeProto()
		node.setOpType('Reshape')
		node.addInput(input)
		node.addInput(`${obj.name}_shape`)
		node.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_shape)
		graph.addNode(node)
		return { size: outSize }
	},
}
