import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle aranda layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'aranda'}} obj Node object
	 */
	export(model, obj) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_exp = new onnx.NodeProto()
		node_exp.setOpType('Exp')
		node_exp.addInput(input)
		node_exp.addOutput(`${obj.name}_exp`)

		const tensor_l = new onnx.TensorProto()
		tensor_l.setName(`${obj.name}_l`)
		tensor_l.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_l.setDimsList([1])
		tensor_l.setFloatDataList([obj.l ?? 2])

		const tensor1 = getConstNodeName(model, 1)

		const node_mult = new onnx.NodeProto()
		node_mult.setOpType('Mul')
		node_mult.addInput(`${obj.name}_exp`)
		node_mult.addInput(`${obj.name}_l`)
		node_mult.addOutput(`${obj.name}_mult`)

		const node_add = new onnx.NodeProto()
		node_add.setOpType('Add')
		node_add.addInput(`${obj.name}_mult`)
		node_add.addInput(tensor1)
		node_add.addOutput(`${obj.name}_add`)

		const node_reciprocal = new onnx.NodeProto()
		node_reciprocal.setOpType('Reciprocal')
		node_reciprocal.addInput(`${obj.name}_add`)
		node_reciprocal.addOutput(`${obj.name}_reciprocal`)

		const node_reciprocal_pow = new onnx.NodeProto()
		node_reciprocal_pow.setOpType('Reciprocal')
		node_reciprocal_pow.addInput(`${obj.name}_l`)
		node_reciprocal_pow.addOutput(`${obj.name}_reciprocal_pow`)

		const node_pow = new onnx.NodeProto()
		node_pow.setOpType('Pow')
		node_pow.addInput(`${obj.name}_reciprocal`)
		node_pow.addInput(`${obj.name}_reciprocal_pow`)
		node_pow.addOutput(`${obj.name}_pow`)

		const node_sub = new onnx.NodeProto()
		node_sub.setOpType('Sub')
		node_sub.addInput(tensor1)
		node_sub.addInput(`${obj.name}_pow`)
		node_sub.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_l)
		graph.addNode(node_exp)
		graph.addNode(node_mult)
		graph.addNode(node_add)
		graph.addNode(node_reciprocal)
		graph.addNode(node_reciprocal_pow)
		graph.addNode(node_pow)
		graph.addNode(node_sub)
	},
}
