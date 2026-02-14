import { onnx } from '../onnx_exporter.js'

/**
 * Handle brelu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'brelu'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj, info) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_relu = new onnx.NodeProto()
		node_relu.setOpType('Relu')
		node_relu.addInput(input)
		node_relu.addOutput(`${obj.name}_relu`)

		const node_neg = new onnx.NodeProto()
		node_neg.setOpType('Neg')
		node_neg.addInput(input)
		node_neg.addOutput(`${obj.name}_neg`)

		const node_neg_relu = new onnx.NodeProto()
		node_neg_relu.setOpType('Relu')
		node_neg_relu.addInput(`${obj.name}_neg`)
		node_neg_relu.addOutput(`${obj.name}_neg_relu`)

		const node_concat = new onnx.NodeProto()
		node_concat.setOpType('Concat')
		node_concat.addInput(`${obj.name}_relu`)
		node_concat.addInput(`${obj.name}_neg_relu`)
		node_concat.addOutput(obj.name)
		const attrAxis = new onnx.AttributeProto()
		attrAxis.setName('axis')
		attrAxis.setType(onnx.AttributeProto.AttributeType.INT)
		attrAxis.setI(-1)
		node_concat.addAttribute(attrAxis)

		const graph = model.getGraph()
		graph.addNode(node_relu)
		graph.addNode(node_neg)
		graph.addNode(node_neg_relu)
		graph.addNode(node_concat)

		const size = info[input].size.concat()
		if (size.at(-1) != null) {
			size[size.length - 1] = size.at(-1) * 2
		}
		return { size }
	},
}
