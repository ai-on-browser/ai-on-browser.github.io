import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle isigmoid layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'isigmoid'}} obj Node object
	 */
	export(model, obj) {
		const tensor_a = getConstNodeName(model, obj.a ?? 1)
		const tensor_alpha = getConstNodeName(model, obj.alpha ?? 1)

		const a = obj.a ?? 1
		const sigmap = 1 / (1 + Math.exp(-a))
		const sigmam = 1 / (1 + Math.exp(a))
		const tensor_diff = getConstNodeName(model, (sigmap + sigmam) / (2 * (obj.alpha ?? 1)))

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_shrink = new onnx.NodeProto()
		node_shrink.setOpType('Shrink')
		node_shrink.addInput(input)
		node_shrink.addOutput(obj.name + '_shrink')
		const attrBias = new onnx.AttributeProto()
		attrBias.setName('bias')
		attrBias.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrBias.setF(a + (sigmam - sigmap) / (2 * (obj.alpha ?? 1)))
		node_shrink.addAttribute(attrBias)
		const attrLambda = new onnx.AttributeProto()
		attrLambda.setName('lambd')
		attrLambda.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrLambda.setF(obj.a ?? 1)
		node_shrink.addAttribute(attrLambda)

		const node_add = new onnx.NodeProto()
		node_add.setOpType('Add')
		node_add.addInput(obj.name + '_shrink')
		node_add.addInput(tensor_diff)
		node_add.addOutput(obj.name + '_add')

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(obj.name + '_add')
		node_mul.addInput(tensor_alpha)
		node_mul.addOutput(obj.name + '_mul')

		const node_abs = new onnx.NodeProto()
		node_abs.setOpType('Abs')
		node_abs.addInput(input)
		node_abs.addOutput(obj.name + '_abs')

		const node_ot_a = new onnx.NodeProto()
		node_ot_a.setOpType('Greater')
		node_ot_a.addInput(obj.name + '_abs')
		node_ot_a.addInput(tensor_a)
		node_ot_a.addOutput(obj.name + '_ot_a')

		const node_sigmoid = new onnx.NodeProto()
		node_sigmoid.setOpType('Sigmoid')
		node_sigmoid.addInput(input)
		node_sigmoid.addOutput(obj.name + '_sigmoid')

		const node_where = new onnx.NodeProto()
		node_where.setOpType('Where')
		node_where.addInput(obj.name + '_ot_a')
		node_where.addInput(obj.name + '_mul')
		node_where.addInput(obj.name + '_sigmoid')
		node_where.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_shrink)
		graph.addNode(node_add)
		graph.addNode(node_mul)
		graph.addNode(node_abs)
		graph.addNode(node_ot_a)
		graph.addNode(node_sigmoid)
		graph.addNode(node_where)
	},
}
