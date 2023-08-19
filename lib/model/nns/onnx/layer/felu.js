import { onnx } from '../onnx_exporter.js'

/**
 * Handle felu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'felu'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_lrelu = new onnx.NodeProto()
		node_lrelu.setOpType('LeakyRelu')
		node_lrelu.addInput(input)
		node_lrelu.addOutput(obj.name + '_lrelu')
		const attrAlpha1 = new onnx.AttributeProto()
		attrAlpha1.setName('alpha')
		attrAlpha1.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrAlpha1.setF(Math.LOG2E)
		node_lrelu.addAttribute(attrAlpha1)

		const node_elu = new onnx.NodeProto()
		node_elu.setOpType('Elu')
		node_elu.addInput(obj.name + '_lrelu')
		node_elu.addOutput(obj.name)
		const attrAlpha2 = new onnx.AttributeProto()
		attrAlpha2.setName('alpha')
		attrAlpha2.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrAlpha2.setF(obj.alpha ?? 1)
		node_elu.addAttribute(attrAlpha2)

		const graph = model.getGraph()
		graph.addNode(node_lrelu)
		graph.addNode(node_elu)
	},
}
