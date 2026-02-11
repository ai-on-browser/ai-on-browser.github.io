import { onnx } from '../onnx_exporter.js'

/**
 * Handle slu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'slu'}} obj Node object
	 */
	export(model, obj) {
		const tensor_alpha = new onnx.TensorProto()
		tensor_alpha.setName(`${obj.name}_alpha`)
		tensor_alpha.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_alpha.setDimsList([1])
		tensor_alpha.setFloatDataList([obj.alpha ?? 3])
		const tensor_beta = new onnx.TensorProto()
		tensor_beta.setName(`${obj.name}_beta`)
		tensor_beta.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_beta.setDimsList([1])
		tensor_beta.setFloatDataList([obj.beta ?? 2])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_neg = new onnx.NodeProto()
		node_neg.setOpType('Neg')
		node_neg.addInput(input)
		node_neg.addOutput(`${obj.name}_neg`)

		const node_div_beta = new onnx.NodeProto()
		node_div_beta.setOpType('Div')
		node_div_beta.addInput(`${obj.name}_neg`)
		node_div_beta.addInput(`${obj.name}_beta`)
		node_div_beta.addOutput(`${obj.name}_div_beta`)

		const node_exp = new onnx.NodeProto()
		node_exp.setOpType('Exp')
		node_exp.addInput(`${obj.name}_div_beta`)
		node_exp.addOutput(`${obj.name}_exp`)

		const node_div_alpha = new onnx.NodeProto()
		node_div_alpha.setOpType('Div')
		node_div_alpha.addInput(input)
		node_div_alpha.addInput(`${obj.name}_alpha`)
		node_div_alpha.addOutput(`${obj.name}_div_alpha`)

		const node_add = new onnx.NodeProto()
		node_add.setOpType('Add')
		node_add.addInput(`${obj.name}_div_alpha`)
		node_add.addInput(`${obj.name}_exp`)
		node_add.addOutput(`${obj.name}_add`)

		const node_div = new onnx.NodeProto()
		node_div.setOpType('Div')
		node_div.addInput(input)
		node_div.addInput(`${obj.name}_add`)
		node_div.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_alpha)
		graph.addInitializer(tensor_beta)
		graph.addNode(node_neg)
		graph.addNode(node_div_beta)
		graph.addNode(node_exp)
		graph.addNode(node_div_alpha)
		graph.addNode(node_add)
		graph.addNode(node_div)
	},
}
