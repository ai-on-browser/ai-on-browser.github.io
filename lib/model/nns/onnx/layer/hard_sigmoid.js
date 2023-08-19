import { onnx } from '../onnx_exporter.js'

/**
 * Handle hard sigmoid layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'hard_sigmoid'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node = new onnx.NodeProto()
		node.setOpType('HardSigmoid')
		node.addInput(input)
		node.addOutput(obj.name)
		const attrAlpha = new onnx.AttributeProto()
		attrAlpha.setName('alpha')
		attrAlpha.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrAlpha.setF(obj.alpha ?? 0.2)
		node.addAttribute(attrAlpha)
		const attrBeta = new onnx.AttributeProto()
		attrBeta.setName('beta')
		attrBeta.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrBeta.setF(obj.beta ?? 0.5)
		node.addAttribute(attrBeta)

		const graph = model.getGraph()
		graph.addNode(node)
	},
}
