import { onnx } from '../onnx_exporter.js'

/**
 * Handle bitwise not layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'bitwise_not'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj, info) {
		const graph = model.getGraph()

		const node = new onnx.NodeProto()
		node.setOpType('BitwiseNot')
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		let outputType = onnx.TensorProto.DataType.INT32
		if (
			[
				onnx.TensorProto.DataType.INT8,
				onnx.TensorProto.DataType.INT16,
				onnx.TensorProto.DataType.INT32,
				onnx.TensorProto.DataType.INT64,
				onnx.TensorProto.DataType.UINT8,
				onnx.TensorProto.DataType.UINT16,
				onnx.TensorProto.DataType.UINT32,
				onnx.TensorProto.DataType.UINT64,
			].includes(info[input].type)
		) {
			node.addInput(input)
			outputType = info[input].type
		} else {
			const castnode = new onnx.NodeProto()
			castnode.setOpType('Cast')
			castnode.addInput(input)
			castnode.addOutput(`${obj.name}_${input}_cast`)
			const to = new onnx.AttributeProto()
			to.setName('to')
			to.setType(onnx.AttributeProto.AttributeType.INT)
			to.setI(onnx.TensorProto.DataType.INT32)
			castnode.addAttribute(to)
			graph.addNode(castnode)
			node.addInput(`${obj.name}_${input}_cast`)
		}

		node.addOutput(obj.name)
		graph.addNode(node)
		return { type: outputType }
	},
}
