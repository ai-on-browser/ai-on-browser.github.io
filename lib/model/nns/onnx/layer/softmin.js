import { onnx } from '../onnx_exporter.js'

/**
 * Handle softmin layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'softmin'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_neg = new onnx.NodeProto()
		node_neg.setOpType('Neg')
		node_neg.addInput(input)
		node_neg.addOutput(obj.name + '_neg')

		const node = new onnx.NodeProto()
		node.setOpType('Softmax')
		node.addInput(obj.name + '_neg')
		node.addOutput(obj.name)
		const attrAxis = new onnx.AttributeProto()
		attrAxis.setName('axis')
		attrAxis.setType(onnx.AttributeProto.AttributeType.INT)
		attrAxis.setI(obj.axis ?? -1)
		node.addAttribute(attrAxis)

		const graph = model.getGraph()
		graph.addNode(node_neg)
		graph.addNode(node)
	},
}
