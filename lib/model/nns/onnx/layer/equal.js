import { onnx } from '../onnx_exporter.js'

/**
 * Handle equal layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'equal'}} obj Node object
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj) {
		if (!Array.isArray(obj.input)) {
			throw new Error(`Invalid attribute 'input' value ${obj.input}.`)
		}
		const graph = model.getGraph()
		const node = new onnx.NodeProto()
		if (obj.input.length === 1) {
			const node_shape = new onnx.NodeProto()
			node_shape.setOpType('Shape')
			node_shape.addInput(obj.input[0])
			node_shape.addOutput(`${obj.name}_shape`)
			graph.addNode(node_shape)

			node.setOpType('ConstantOfShape')
			node.addInput(`${obj.name}_shape`)

			const tensor = new onnx.TensorProto()
			tensor.setDataType(onnx.TensorProto.DataType.BOOL)
			tensor.setDimsList([1])
			tensor.setInt32DataList([1])
			const attrValue = new onnx.AttributeProto()
			attrValue.setName('value')
			attrValue.setType(onnx.AttributeProto.AttributeType.TENSOR)
			attrValue.setT(tensor)
			node.addAttribute(attrValue)
		} else if (obj.input.length === 2) {
			node.setOpType('Equal')
			node.addInput(obj.input[0])
			node.addInput(obj.input[1])
		} else {
			for (let i = 0; i < obj.input.length - 1; i++) {
				const node_equal = new onnx.NodeProto()
				node_equal.setOpType('Equal')
				node_equal.addInput(obj.input[i])
				node_equal.addInput(obj.input[i + 1])
				node_equal.addOutput(`${obj.name}_eq_${i}`)
				graph.addNode(node_equal)
			}
			let prev_in = `${obj.name}_eq_0`
			for (let i = 1; i < obj.input.length - 2; i++) {
				const node_mul = new onnx.NodeProto()
				node_mul.setOpType('And')
				node_mul.addInput(prev_in)
				node_mul.addInput(`${obj.name}_eq_${i}`)
				node_mul.addOutput((prev_in = `${obj.name}_and_${i - 1}`))
				graph.addNode(node_mul)
			}

			node.setOpType('And')
			node.addInput(prev_in)
			node.addInput(`${obj.name}_eq_${obj.input.length - 2}`)
		}
		node.addOutput(obj.name)
		graph.addNode(node)
		return { type: onnx.TensorProto.DataType.BOOL }
	},
}
