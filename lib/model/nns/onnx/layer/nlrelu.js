import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle nlrelu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'nlrelu'}} obj Node object
	 */
	export(model, obj) {
		const tensor1 = getConstNodeName(model, 1)
		const tensor_beta = new onnx.TensorProto()
		tensor_beta.setName(`${obj.name}_beta`)
		tensor_beta.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_beta.setDimsList([1])
		tensor_beta.setFloatDataList([obj.beta ?? 1])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_relu = new onnx.NodeProto()
		node_relu.setOpType('Relu')
		node_relu.addInput(input)
		node_relu.addOutput(`${obj.name}_relu`)

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(`${obj.name}_relu`)
		node_mul.addInput(`${obj.name}_beta`)
		node_mul.addOutput(`${obj.name}_mul`)

		const node_add = new onnx.NodeProto()
		node_add.setOpType('Add')
		node_add.addInput(`${obj.name}_mul`)
		node_add.addInput(tensor1)
		node_add.addOutput(`${obj.name}_add`)

		const node_log = new onnx.NodeProto()
		node_log.setOpType('Log')
		node_log.addInput(`${obj.name}_add`)
		node_log.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_beta)
		graph.addNode(node_relu)
		graph.addNode(node_mul)
		graph.addNode(node_add)
		graph.addNode(node_log)
	},
}
