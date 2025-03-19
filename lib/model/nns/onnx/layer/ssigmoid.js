import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle ssigmoid layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'ssigmoid'}} obj Node object
	 */
	export(model, obj) {
		const tensor2 = getConstNodeName(model, 2)
		const tensor4 = getConstNodeName(model, 4)

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_sigmoid = new onnx.NodeProto()
		node_sigmoid.setOpType('Sigmoid')
		node_sigmoid.addInput(input)
		node_sigmoid.addOutput(obj.name + '_sigmoid')

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(obj.name + '_sigmoid')
		node_mul.addInput(tensor4)
		node_mul.addOutput(obj.name + '_mul')

		const node_sub = new onnx.NodeProto()
		node_sub.setOpType('Sub')
		node_sub.addInput(obj.name + '_mul')
		node_sub.addInput(tensor2)
		node_sub.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node_sigmoid)
		graph.addNode(node_mul)
		graph.addNode(node_sub)
	},
}
