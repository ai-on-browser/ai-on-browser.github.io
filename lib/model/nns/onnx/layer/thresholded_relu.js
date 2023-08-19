import { onnx } from '../onnx_exporter.js'

/**
 * Handle thresholded relu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'thresholded_relu'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node = new onnx.NodeProto()
		node.setOpType('ThresholdedRelu')
		node.addInput(input)
		node.addOutput(obj.name)
		const attrAlpha = new onnx.AttributeProto()
		attrAlpha.setName('alpha')
		attrAlpha.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrAlpha.setF(obj.a ?? 1)
		node.addAttribute(attrAlpha)

		const graph = model.getGraph()
		graph.addNode(node)
	},
}
