import { onnx } from '../onnx_exporter.js'

/**
 * Handle transpose layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'transpose'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj, info) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node = new onnx.NodeProto()
		node.setOpType('Transpose')
		node.addInput(input)
		node.addOutput(obj.name)
		const attrPerm = new onnx.AttributeProto()
		attrPerm.setName('perm')
		attrPerm.setType(onnx.AttributeProto.AttributeType.INTS)
		attrPerm.setIntsList(obj.axis)
		node.addAttribute(attrPerm)

		const graph = model.getGraph()
		graph.addNode(node)

		const size = info[input].size.concat()
		return { size: obj.axis.map(i => size[i]) }
	},
}
