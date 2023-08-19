import { onnx } from '../onnx_exporter.js'

/**
 * Handle is inf layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'is_inf'}} obj Node object
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node = new onnx.NodeProto()
		node.setOpType('IsInf')
		node.addInput(input)
		node.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node)
		return { type: onnx.TensorProto.DataType.BOOL }
	},
}
