import { onnx } from '../onnx_exporter.js'

/**
 * Handle rrelu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'rrelu'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node = new onnx.NodeProto()
		node.setOpType('LeakyRelu')
		node.addInput(input)
		node.addOutput(obj.name)
		const attrAlpha = new onnx.AttributeProto()
		attrAlpha.setName('alpha')
		attrAlpha.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrAlpha.setF(((obj.l ?? 1 / 8) + (obj.u ?? 1 / 3)) / 2)
		node.addAttribute(attrAlpha)

		const graph = model.getGraph()
		graph.addNode(node)
	},
}
