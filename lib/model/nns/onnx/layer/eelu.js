import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle eelu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'eelu'}} obj Node object
	 */
	export(model, obj) {
		const tensor0 = getConstNodeName(model, 0)
		const tensor_k = new onnx.TensorProto()
		tensor_k.setName(`${obj.name}_k`)
		tensor_k.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_k.setDimsList([1])
		tensor_k.setFloatDataList([obj.k ?? 1])
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

		const node_pos = new onnx.NodeProto()
		node_pos.setOpType('Mul')
		node_pos.addInput(`${obj.name}_relu`)
		node_pos.addInput(`${obj.name}_k`)
		node_pos.addOutput(`${obj.name}_p`)

		const node_min = new onnx.NodeProto()
		node_min.setOpType('Min')
		node_min.addInput(input)
		node_min.addInput(tensor0)
		node_min.addOutput(`${obj.name}_min`)

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(`${obj.name}_min`)
		node_mul.addInput(`${obj.name}_beta`)
		node_mul.addOutput(`${obj.name}_mul`)

		const node_elu = new onnx.NodeProto()
		node_elu.setOpType('Elu')
		node_elu.addInput(`${obj.name}_mul`)
		node_elu.addOutput(`${obj.name}_elu`)
		const attrAlpha = new onnx.AttributeProto()
		attrAlpha.setName('alpha')
		attrAlpha.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrAlpha.setF(obj.alpha ?? 1)
		node_elu.addAttribute(attrAlpha)

		const node_add = new onnx.NodeProto()
		node_add.setOpType('Add')
		node_add.addInput(`${obj.name}_p`)
		node_add.addInput(`${obj.name}_elu`)
		node_add.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_k)
		graph.addInitializer(tensor_beta)
		graph.addNode(node_relu)
		graph.addNode(node_pos)
		graph.addNode(node_min)
		graph.addNode(node_mul)
		graph.addNode(node_elu)
		graph.addNode(node_add)
	},
}
