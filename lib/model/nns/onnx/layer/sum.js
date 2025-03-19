import { onnx } from '../onnx_exporter.js'

/**
 * Handle sum layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'sum'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj, info) {
		const graph = model.getGraph()

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node = new onnx.NodeProto()
		node.setOpType('ReduceSum')
		node.addInput(input)
		node.addOutput(obj.name)

		const keepdims = obj.keepdims ?? true ? 1 : 0
		const attrKeepdims = new onnx.AttributeProto()
		attrKeepdims.setName('keepdims')
		attrKeepdims.setType(onnx.AttributeProto.AttributeType.INT)
		attrKeepdims.setI(keepdims)
		node.addAttribute(attrKeepdims)
		graph.addNode(node)

		const size = info[input].size.concat()
		if (typeof obj.axis === 'string') {
			throw new Error('Unsupported axis type string')
		} else if (obj.axis == null || (typeof obj.axis === 'number' && obj.axis < 0)) {
			return { size: keepdims ? Array(size.length).fill(1) : [] }
		}
		const axis = Array.isArray(obj.axis) ? obj.axis : [obj.axis]
		const tensor_axis = new onnx.TensorProto()
		tensor_axis.setName(obj.name + '_axis')
		tensor_axis.setDataType(onnx.TensorProto.DataType.INT64)
		tensor_axis.setDimsList([axis.length])
		tensor_axis.setInt64DataList(axis)
		graph.addInitializer(tensor_axis)
		node.addInput(obj.name + '_axis')

		axis.sort((a, b) => b - a)
		if (keepdims) {
			for (const i of axis) {
				size[i] = 1
			}
		} else {
			for (const i of axis) {
				size.splice(i, 1)
			}
		}
		return { size }
	},
}
