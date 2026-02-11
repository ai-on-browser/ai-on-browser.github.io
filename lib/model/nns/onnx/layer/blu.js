import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle blu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'blu'}} obj Node object
	 */
	export(model, obj) {
		const tensor1 = getConstNodeName(model, 1)
		const tensor2 = getConstNodeName(model, 2)

		const tensor_beta = new onnx.TensorProto()
		tensor_beta.setName(`${obj.name}_beta`)
		tensor_beta.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_beta.setDimsList([1])
		tensor_beta.setFloatDataList([obj.beta ?? 0.1])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_pow = new onnx.NodeProto()
		node_pow.setOpType('Pow')
		node_pow.addInput(input)
		node_pow.addInput(tensor2)
		node_pow.addOutput(`${obj.name}_pow`)

		const node_add1 = new onnx.NodeProto()
		node_add1.setOpType('Add')
		node_add1.addInput(`${obj.name}_pow`)
		node_add1.addInput(tensor1)
		node_add1.addOutput(`${obj.name}_add1`)

		const node_sqrt = new onnx.NodeProto()
		node_sqrt.setOpType('Sqrt')
		node_sqrt.addInput(`${obj.name}_add1`)
		node_sqrt.addOutput(`${obj.name}_sqrt`)

		const node_sub1 = new onnx.NodeProto()
		node_sub1.setOpType('Sub')
		node_sub1.addInput(`${obj.name}_sqrt`)
		node_sub1.addInput(tensor1)
		node_sub1.addOutput(`${obj.name}_sub1`)

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(`${obj.name}_beta`)
		node_mul.addInput(`${obj.name}_sub1`)
		node_mul.addOutput(`${obj.name}_mul`)

		const node_addv = new onnx.NodeProto()
		node_addv.setOpType('Add')
		node_addv.addInput(input)
		node_addv.addInput(`${obj.name}_mul`)
		node_addv.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_beta)
		graph.addNode(node_pow)
		graph.addNode(node_add1)
		graph.addNode(node_sqrt)
		graph.addNode(node_sub1)
		graph.addNode(node_mul)
		graph.addNode(node_addv)
	},
}
