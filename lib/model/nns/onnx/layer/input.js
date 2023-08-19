import { onnx } from '../onnx_exporter.js'

/**
 * Handle input layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'input'}} obj Node object
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj) {
		const inSize = obj.size
		if (!inSize) {
			throw new Error('Input layer must specify the size')
		}
		const valueInfo = new onnx.ValueInfoProto()
		const type = new onnx.TypeProto()
		const tt = new onnx.TypeProto.Tensor()
		tt.setElemType(onnx.TensorProto.DataType.FLOAT)
		const shape = new onnx.TensorShapeProto()
		shape.setDimList(
			inSize.map(d => {
				const dim = new onnx.TensorShapeProto.Dimension()
				dim.setDimValue(d ?? -1)
				return dim
			})
		)
		tt.setShape(shape)
		type.setTensorType(tt)
		valueInfo.setType(type)
		valueInfo.setName(obj.name)

		const graph = model.getGraph()
		graph.addInput(valueInfo)

		return { type: onnx.TensorProto.DataType.FLOAT, size: inSize }
	},
}
