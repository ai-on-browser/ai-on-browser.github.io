import { onnx } from '../onnx_exporter.js'

/**
 * Handle softmax layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'softmax'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node = new onnx.NodeProto()
		node.setOpType('Softmax')
		node.addInput(input)
		node.addOutput(obj.name)
		const attrAxis = new onnx.AttributeProto()
		attrAxis.setName('axis')
		attrAxis.setType(onnx.AttributeProto.AttributeType.INT)
		attrAxis.setI(obj.axis ?? -1)
		node.addAttribute(attrAxis)

		const graph = model.getGraph()
		graph.addNode(node)
	},
}
