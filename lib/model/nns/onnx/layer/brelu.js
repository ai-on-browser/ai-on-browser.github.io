import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle brelu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'brelu'}} obj Node object
	 */
	export(model, obj) {
		const tensor_a = getConstNodeName(model, obj.a ?? 1)

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_hardsigmoid = new onnx.NodeProto()
		node_hardsigmoid.setOpType('HardSigmoid')
		node_hardsigmoid.addInput(input)
		node_hardsigmoid.addOutput(obj.name + '_hardsigmoid')
		const attrAlpha = new onnx.AttributeProto()
		attrAlpha.setName('alpha')
		attrAlpha.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrAlpha.setF(1 / (obj.a ?? 1))
		const attrBeta = new onnx.AttributeProto()
		attrBeta.setName('beta')
		attrBeta.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrBeta.setF(0)
		node_hardsigmoid.setAttributeList([attrAlpha, attrBeta])

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(tensor_a)
		node_mul.addInput(obj.name + '_hardsigmoid')
		node_mul.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_hardsigmoid)
		graph.addNode(node_mul)
	},
}
