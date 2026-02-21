import { onnx } from '../onnx_exporter.js'

/**
 * Handle or layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'or'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]} | undefined} Output information of this layer
	 */
	export(model, obj, info) {
		if (!Array.isArray(obj.input)) {
			throw new Error(`Invalid attribute 'input' value ${obj.input}.`)
		}
		const graph = model.getGraph()

		const node = new onnx.NodeProto()
		if (obj.input.length === 1) {
			node.setOpType('Identity')
			node.addInput(obj.input[0])
			node.addOutput(obj.name)
			graph.addNode(node)
			return
		}
		const boolInputs = []
		for (const i of obj.input) {
			if (info[i].type === onnx.TensorProto.DataType.BOOL) {
				boolInputs.push(i)
			} else {
				const castnode = new onnx.NodeProto()
				castnode.setOpType('Cast')
				castnode.addInput(i)
				castnode.addOutput(`${obj.name}_${i}_cast`)
				const to = new onnx.AttributeProto()
				to.setName('to')
				to.setType(onnx.AttributeProto.AttributeType.INT)
				to.setI(onnx.TensorProto.DataType.BOOL)
				castnode.addAttribute(to)
				graph.addNode(castnode)
				boolInputs.push(`${obj.name}_${i}_cast`)
			}
		}
		let prev_in = boolInputs[0]
		for (let i = 1; i < boolInputs.length - 1; i++) {
			const node_or = new onnx.NodeProto()
			node_or.setOpType('Or')
			node_or.addInput(prev_in)
			node_or.addInput(boolInputs[i])
			prev_in = `${obj.name}_or_${i - 1}`
			node_or.addOutput(prev_in)
			graph.addNode(node_or)
		}

		node.setOpType('Or')
		node.addInput(prev_in)
		node.addInput(boolInputs.at(-1))

		node.addOutput(obj.name)
		graph.addNode(node)
		return { type: onnx.TensorProto.DataType.BOOL }
	},
}
