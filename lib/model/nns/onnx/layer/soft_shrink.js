import { onnx } from '../onnx_exporter.js'

/**
 * Handle soft shrink layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'soft_shrink'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node = new onnx.NodeProto()
		node.setOpType('Shrink')
		node.addInput(input)
		node.addOutput(obj.name)
		const attrBias = new onnx.AttributeProto()
		attrBias.setName('bias')
		attrBias.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrBias.setF(obj.l ?? 0.5)
		node.addAttribute(attrBias)
		const attrLambda = new onnx.AttributeProto()
		attrLambda.setName('lambd')
		attrLambda.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrLambda.setF(obj.l ?? 0.5)
		node.addAttribute(attrLambda)

		const graph = model.getGraph()
		graph.addNode(node)
	},
}
