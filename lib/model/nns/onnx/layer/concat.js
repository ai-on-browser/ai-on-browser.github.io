import { onnx } from '../onnx_exporter.js'

/**
 * Handle concat layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'concat'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj, info) {
		if (!Array.isArray(obj.input)) {
			throw new Error(`Invalid attribute 'input' value ${obj.input}.`)
		}
		const node = new onnx.NodeProto()
		node.setOpType('Concat')
		for (const i of obj.input) {
			node.addInput(i)
		}
		node.addOutput(obj.name)
		const axis = obj.axis ?? 1
		const attrAxis = new onnx.AttributeProto()
		attrAxis.setName('axis')
		attrAxis.setType(onnx.AttributeProto.AttributeType.INT)
		attrAxis.setI(obj.axis ?? 1)
		node.addAttribute(attrAxis)

		const graph = model.getGraph()
		graph.addNode(node)

		const size = info[obj.input[0]].size.concat()
		if (size[axis] != null) {
			for (let i = 1; i < obj.input.length; i++) {
				if (info[obj.input[i]].size[axis] == null) {
					size[axis] = null
					break
				}
				size[axis] += info[obj.input[i]].size[axis]
			}
		}
		return { size }
	},
}
