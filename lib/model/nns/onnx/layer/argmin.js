import { onnx } from '../onnx_exporter.js'

/**
 * Handle argmin layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'argmin'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj, info) {
		const graph = model.getGraph()

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node = new onnx.NodeProto()
		node.setOpType('ArgMin')
		node.addInput(input)
		node.addOutput(obj.name)

		const axis = new onnx.AttributeProto()
		axis.setName('axis')
		axis.setType(onnx.AttributeProto.AttributeType.INT)
		axis.setI(obj.axis ?? -1)
		node.addAttribute(axis)
		const keepdims = new onnx.AttributeProto()
		keepdims.setName('keepdims')
		keepdims.setType(onnx.AttributeProto.AttributeType.INT)
		keepdims.setI((obj.keepdims ?? true) ? 1 : 0)
		node.addAttribute(keepdims)

		graph.addNode(node)

		const size = info[input].size.concat()
		const targetAxis = axis.getI() < 0 ? axis.getI() + size.length : axis.getI()
		if (obj.keepdims ?? true) {
			size[targetAxis] = 1
		} else {
			size.splice(targetAxis, 1)
		}
		return { type: onnx.TensorProto.DataType.INT64, size }
	},
}
