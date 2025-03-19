import { onnx } from '../onnx_exporter.js'

/**
 * Handle output layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'output'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 */
	export(model, obj, info) {
		const valueInfo = new onnx.ValueInfoProto()
		const type = new onnx.TypeProto()
		const inputName = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const tt = new onnx.TypeProto.Tensor()
		tt.setElemType(info[inputName].type)
		const shape = new onnx.TensorShapeProto()
		const outputDims = info[inputName].size ?? [-1, -1]
		shape.setDimList(
			outputDims.map(d => {
				const dim = new onnx.TensorShapeProto.Dimension()
				dim.setDimValue(d)
				return dim
			})
		)
		tt.setShape(shape)
		type.setTensorType(tt)
		valueInfo.setType(type)
		valueInfo.setName(obj.input)

		const graph = model.getGraph()
		graph.addOutput(valueInfo)
	},
}
