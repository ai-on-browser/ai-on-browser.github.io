import { onnx } from '../onnx_exporter.js'

const acceptTypes = [
	onnx.TensorProto.DataType.INT8,
	onnx.TensorProto.DataType.INT16,
	onnx.TensorProto.DataType.INT32,
	onnx.TensorProto.DataType.INT64,
	onnx.TensorProto.DataType.UINT8,
	onnx.TensorProto.DataType.UINT16,
	onnx.TensorProto.DataType.UINT32,
	onnx.TensorProto.DataType.UINT64,
]

/**
 * Handle bitwise or layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'bitwise_or'}} obj Node object
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
		const intInputs = []
		for (const i of obj.input) {
			if (acceptTypes.includes(info[i].type)) {
				intInputs.push(i)
			} else {
				const castnode = new onnx.NodeProto()
				castnode.setOpType('Cast')
				castnode.addInput(i)
				castnode.addOutput(`${obj.name}_${i}_cast`)
				const to = new onnx.AttributeProto()
				to.setName('to')
				to.setType(onnx.AttributeProto.AttributeType.INT)
				to.setI(onnx.TensorProto.DataType.INT32)
				castnode.addAttribute(to)
				graph.addNode(castnode)
				intInputs.push(`${obj.name}_${i}_cast`)
			}
		}
		let prev_in = intInputs[0]
		for (let i = 1; i < intInputs.length - 1; i++) {
			const node_bitwiseor = new onnx.NodeProto()
			node_bitwiseor.setOpType('BitwiseOr')
			node_bitwiseor.addInput(prev_in)
			node_bitwiseor.addInput(intInputs[i])
			node_bitwiseor.addOutput((prev_in = `${obj.name}_bitwiseor_${i - 1}`))
			graph.addNode(node_bitwiseor)
		}

		node.setOpType('BitwiseOr')
		node.addInput(prev_in)
		node.addInput(intInputs.at(-1))

		node.addOutput(obj.name)
		graph.addNode(node)
		return { type: onnx.TensorProto.DataType.INT32 }
	},
}
