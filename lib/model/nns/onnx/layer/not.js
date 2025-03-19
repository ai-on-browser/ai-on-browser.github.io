import { onnx } from '../onnx_exporter.js'

/**
 * Handle not layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'not'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj, info) {
		const graph = model.getGraph()

		const node = new onnx.NodeProto()
		node.setOpType('Not')
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		if (onnx.TensorProto.DataType.BOOL === info[input].type) {
			node.addInput(input)
		} else {
			const castnode = new onnx.NodeProto()
			castnode.setOpType('Cast')
			castnode.addInput(input)
			castnode.addOutput(`${obj.name}_${input}_cast`)
			const to = new onnx.AttributeProto()
			to.setName('to')
			to.setType(onnx.AttributeProto.AttributeType.INT)
			to.setI(onnx.TensorProto.DataType.BOOL)
			castnode.addAttribute(to)
			graph.addNode(castnode)
			node.addInput(`${obj.name}_${input}_cast`)
		}

		node.addOutput(obj.name)
		graph.addNode(node)
		return { type: onnx.TensorProto.DataType.BOOL }
	},
}
