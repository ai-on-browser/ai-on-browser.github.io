import { onnx } from '../onnx_exporter.js'

/**
 * Handle hard elish layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'hard_elish'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_elu = new onnx.NodeProto()
		node_elu.setOpType('Elu')
		node_elu.addInput(input)
		node_elu.addOutput(`${obj.name}_elu`)

		const node_hardsigmoid = new onnx.NodeProto()
		node_hardsigmoid.setOpType('HardSigmoid')
		node_hardsigmoid.addInput(input)
		node_hardsigmoid.addOutput(`${obj.name}_hardsigmoid`)
		const attrAlpha = new onnx.AttributeProto()
		attrAlpha.setName('alpha')
		attrAlpha.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrAlpha.setF(0.5)
		node_hardsigmoid.addAttribute(attrAlpha)
		const attrBeta = new onnx.AttributeProto()
		attrBeta.setName('beta')
		attrBeta.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrBeta.setF(0.5)
		node_hardsigmoid.addAttribute(attrBeta)

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(`${obj.name}_elu`)
		node_mul.addInput(`${obj.name}_hardsigmoid`)
		node_mul.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_elu)
		graph.addNode(node_hardsigmoid)
		graph.addNode(node_mul)
	},
}
