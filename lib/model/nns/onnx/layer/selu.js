import { onnx } from '../onnx_exporter.js'

/**
 * Handle elu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'elu'}} obj Node object
	 */
	export(model, obj) {
		const tensor_g = new onnx.TensorProto()
		tensor_g.setName(`${obj.name}_g`)
		tensor_g.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_g.setDimsList([1])
		tensor_g.setFloatDataList([obj.g ?? 1.05070102214813232421875])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_elu = new onnx.NodeProto()
		node_elu.setOpType('Elu')
		node_elu.addInput(input)
		node_elu.addOutput(`${obj.name}_elu`)
		const attrAlpha = new onnx.AttributeProto()
		attrAlpha.setName('alpha')
		attrAlpha.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrAlpha.setF(obj.a ?? 1.67326319217681884765625)
		node_elu.addAttribute(attrAlpha)

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(`${obj.name}_elu`)
		node_mul.addInput(`${obj.name}_g`)
		node_mul.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_g)
		graph.addNode(node_elu)
		graph.addNode(node_mul)
	},
}
