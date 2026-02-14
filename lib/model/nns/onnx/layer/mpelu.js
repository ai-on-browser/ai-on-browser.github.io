import { onnx } from '../onnx_exporter.js'

/**
 * Handle mpelu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'mpelu'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_lrelu = new onnx.NodeProto()
		node_lrelu.setOpType('LeakyRelu')
		node_lrelu.addInput(input)
		node_lrelu.addOutput(`${obj.name}_lrelu`)
		const attrBeta = new onnx.AttributeProto()
		attrBeta.setName('alpha')
		attrBeta.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrBeta.setF(obj.beta ?? 1)
		node_lrelu.addAttribute(attrBeta)

		const node_elu = new onnx.NodeProto()
		node_elu.setOpType('Elu')
		node_elu.addInput(`${obj.name}_lrelu`)
		node_elu.addOutput(`${obj.name}_elu`)

		const node_lrelu2 = new onnx.NodeProto()
		node_lrelu2.setOpType('LeakyRelu')
		node_lrelu2.addInput(`${obj.name}_elu`)
		node_lrelu2.addOutput(obj.name)
		const attrAlpha = new onnx.AttributeProto()
		attrAlpha.setName('alpha')
		attrAlpha.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrAlpha.setF(obj.alpha ?? 1)
		node_lrelu2.addAttribute(attrBeta)

		const graph = model.getGraph()
		graph.addNode(node_lrelu)
		graph.addNode(node_elu)
		graph.addNode(node_lrelu2)
	},
}
