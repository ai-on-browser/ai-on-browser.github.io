import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle pdelu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'pdelu'}} obj Node object
	 */
	export(model, obj) {
		const tensor0 = getConstNodeName(model, 0)
		const tensor1 = getConstNodeName(model, 1)
		const tensor_alpha = new onnx.TensorProto()
		tensor_alpha.setName(`${obj.name}_alpha`)
		tensor_alpha.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_alpha.setDimsList([1])
		tensor_alpha.setFloatDataList([obj.alpha ?? 1])
		const tensor_t = new onnx.TensorProto()
		tensor_t.setName(`${obj.name}_t`)
		tensor_t.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_t.setDimsList([1])
		tensor_t.setFloatDataList([obj.t ?? 0.1])

		const node_sub_t = new onnx.NodeProto()
		node_sub_t.setOpType('Sub')
		node_sub_t.addInput(tensor1)
		node_sub_t.addInput(`${obj.name}_t`)
		node_sub_t.addOutput(`${obj.name}_1-t`)

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(input)
		node_mul.addInput(`${obj.name}_1-t`)
		node_mul.addOutput(`${obj.name}_(1-t)*v`)

		const node_add_1 = new onnx.NodeProto()
		node_add_1.setOpType('Add')
		node_add_1.addInput(`${obj.name}_(1-t)*v`)
		node_add_1.addInput(tensor1)
		node_add_1.addOutput(`${obj.name}_1+(1-t)*v`)

		const node_inv = new onnx.NodeProto()
		node_inv.setOpType('Reciprocal')
		node_inv.addInput(`${obj.name}_1-t`)
		node_inv.addOutput(`${obj.name}_1/(1-t)`)

		const node_pow = new onnx.NodeProto()
		node_pow.setOpType('Pow')
		node_pow.addInput(`${obj.name}_1+(1-t)*v`)
		node_pow.addInput(`${obj.name}_1/(1-t)`)
		node_pow.addOutput(`${obj.name}_pow`)

		const node_sub = new onnx.NodeProto()
		node_sub.setOpType('Sub')
		node_sub.addInput(`${obj.name}_pow`)
		node_sub.addInput(tensor1)
		node_sub.addOutput(`${obj.name}_sub`)

		const node_mul_alpha = new onnx.NodeProto()
		node_mul_alpha.setOpType('Mul')
		node_mul_alpha.addInput(`${obj.name}_sub`)
		node_mul_alpha.addInput(`${obj.name}_alpha`)
		node_mul_alpha.addOutput(`${obj.name}_mul_alpha`)

		const node_posneg = new onnx.NodeProto()
		node_posneg.setOpType('Greater')
		node_posneg.addInput(input)
		node_posneg.addInput(tensor0)
		node_posneg.addOutput(`${obj.name}_posneg`)

		const node_where = new onnx.NodeProto()
		node_where.setOpType('Where')
		node_where.addInput(`${obj.name}_posneg`)
		node_where.addInput(input)
		node_where.addInput(`${obj.name}_mul_alpha`)
		node_where.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_alpha)
		graph.addInitializer(tensor_t)
		graph.addNode(node_sub_t)
		graph.addNode(node_mul)
		graph.addNode(node_add_1)
		graph.addNode(node_inv)
		graph.addNode(node_pow)
		graph.addNode(node_sub)
		graph.addNode(node_mul_alpha)
		graph.addNode(node_posneg)
		graph.addNode(node_where)
	},
}
