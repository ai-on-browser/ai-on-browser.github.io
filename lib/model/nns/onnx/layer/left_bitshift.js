import { onnx } from '../onnx_exporter.js'

const acceptTypes = [
	onnx.TensorProto.DataType.UINT8,
	onnx.TensorProto.DataType.UINT16,
	onnx.TensorProto.DataType.UINT32,
	onnx.TensorProto.DataType.UINT64,
]

/**
 * Handle left bitshift layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'left_bitshift'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]} | undefined} Output information of this layer
	 */
	export(model, obj, info) {
		if (!Array.isArray(obj.input)) {
			throw new Error(`Invalid attribute 'input' value ${obj.input}.`)
		}
		const graph = model.getGraph()
		const attrDirection = new onnx.AttributeProto()
		attrDirection.setName('direction')
		attrDirection.setType(onnx.AttributeProto.AttributeType.STRING)
		attrDirection.setS(new TextEncoder().encode('LEFT'))

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
				to.setI(onnx.TensorProto.DataType.UINT32)
				castnode.addAttribute(to)
				graph.addNode(castnode)
				intInputs.push(`${obj.name}_${i}_cast`)
			}
		}
		let prev_in = intInputs[0]
		for (let i = 1; i < intInputs.length - 1; i++) {
			const node_shift = new onnx.NodeProto()
			node_shift.setOpType('BitShift')
			node_shift.addInput(prev_in)
			node_shift.addInput(intInputs[i])
			node_shift.addOutput((prev_in = `${obj.name}_bitshift_${i - 1}`))
			node_shift.addAttribute(attrDirection)
			graph.addNode(node_shift)
		}

		node.setOpType('BitShift')
		node.addInput(prev_in)
		node.addInput(intInputs.at(-1))
		node.addAttribute(attrDirection)

		node.addOutput(obj.name)
		graph.addNode(node)
		return { type: onnx.TensorProto.DataType.UINT32 }
	},
}
