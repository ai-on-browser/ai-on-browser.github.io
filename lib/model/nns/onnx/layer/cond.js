import { onnx } from '../onnx_exporter.js'

/**
 * Handle cond layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'cond'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]} | undefined} Output information of this layer
	 */
	export(model, obj, info) {
		if (!Array.isArray(obj.input) || obj.input.length !== 3) {
			throw new Error(`Invalid attribute 'input' value ${obj.input}.`)
		}
		const graph = model.getGraph()
		const node = new onnx.NodeProto()
		node.setOpType('Where')
		if (info[obj.input[0]].type === onnx.TensorProto.DataType.BOOL) {
			node.addInput(obj.input[0])
		} else {
			const castnode = new onnx.NodeProto()
			castnode.setOpType('Cast')
			castnode.addInput(obj.input[0])
			castnode.addOutput(`${obj.name}_cast`)
			const to = new onnx.AttributeProto()
			to.setName('to')
			to.setType(onnx.AttributeProto.AttributeType.INT)
			to.setI(onnx.TensorProto.DataType.BOOL)
			castnode.addAttribute(to)
			graph.addNode(castnode)
			node.addInput(`${obj.name}_cast`)
		}
		node.addInput(obj.input[1])
		node.addInput(obj.input[2])
		node.addOutput(obj.name)

		graph.addNode(node)

		return { type: info[obj.input[1]].type }
	},
}
