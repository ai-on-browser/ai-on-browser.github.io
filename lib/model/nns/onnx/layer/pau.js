import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle pau layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'pelu'}} obj Node object
	 */
	export(model, obj) {
		const graph = model.getGraph()
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input

		const a = Array.isArray(obj.a) ? obj.a : Array((obj.m ?? 2) + 1).fill(obj.a ?? 0.1)
		const b = Array.isArray(obj.b) ? obj.b : Array(obj.n ?? 2).fill(obj.b ?? 0)

		let vprev = input
		for (let i = 2; i < Math.max(a.length, b.length + 1); i++) {
			const node_mul = new onnx.NodeProto()
			node_mul.setOpType('Mul')
			node_mul.addInput(input)
			node_mul.addInput(vprev)
			node_mul.addOutput((vprev = `${obj.name}_pow${i}`))
			graph.addNode(node_mul)
		}

		const node_a = new onnx.NodeProto()
		node_a.setOpType('Sum')
		graph.addNode(node_a)

		const tensor_a0 = new onnx.TensorProto()
		tensor_a0.setName(`${obj.name}_a0`)
		tensor_a0.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_a0.setDimsList([1])
		tensor_a0.setFloatDataList([a[0]])
		graph.addInitializer(tensor_a0)

		node_a.addInput(`${obj.name}_a0`)
		for (let k = 1; k < a.length; k++) {
			const tensor_a = new onnx.TensorProto()
			tensor_a.setName(`${obj.name}_a${k}`)
			tensor_a.setDataType(onnx.TensorProto.DataType.FLOAT)
			tensor_a.setDimsList([1])
			tensor_a.setFloatDataList([a[k]])
			graph.addInitializer(tensor_a)

			const node_term = new onnx.NodeProto()
			node_term.setOpType('Mul')
			node_term.addInput(k === 1 ? input : `${obj.name}_pow${k}`)
			node_term.addInput(`${obj.name}_a${k}`)
			node_term.addOutput(`${obj.name}_mul_a${k}`)
			graph.addNode(node_term)
			node_a.addInput(`${obj.name}_mul_a${k}`)
		}

		if (b.length === 0) {
			node_a.addOutput(obj.name)
			return
		}
		node_a.addOutput(`${obj.name}_a`)

		const node_b = new onnx.NodeProto()
		node_b.setOpType('Sum')
		node_b.addOutput(`${obj.name}_b`)
		graph.addNode(node_b)
		for (let k = 0; k < b.length; k++) {
			const tensor_b = new onnx.TensorProto()
			tensor_b.setName(`${obj.name}_b${k}`)
			tensor_b.setDataType(onnx.TensorProto.DataType.FLOAT)
			tensor_b.setDimsList([1])
			tensor_b.setFloatDataList([b[k]])
			graph.addInitializer(tensor_b)

			const node_term = new onnx.NodeProto()
			node_term.setOpType('Mul')
			node_term.addInput(k === 0 ? input : `${obj.name}_pow${k + 1}`)
			node_term.addInput(`${obj.name}_b${k}`)
			node_term.addOutput(`${obj.name}_mul_b${k}`)
			graph.addNode(node_term)
			node_b.addInput(`${obj.name}_mul_b${k}`)
		}

		const node_abs = new onnx.NodeProto()
		node_abs.setOpType('Abs')
		node_abs.addInput(`${obj.name}_b`)
		node_abs.addOutput(`${obj.name}_abs`)
		graph.addNode(node_abs)

		const tensor1 = getConstNodeName(model, 1)
		const node_add = new onnx.NodeProto()
		node_add.setOpType('Add')
		node_add.addInput(tensor1)
		node_add.addInput(`${obj.name}_abs`)
		node_add.addOutput(`${obj.name}_add`)
		graph.addNode(node_add)

		const node_div = new onnx.NodeProto()
		node_div.setOpType('Div')
		node_div.addInput(`${obj.name}_a`)
		node_div.addInput(`${obj.name}_add`)
		node_div.addOutput(obj.name)
		graph.addNode(node_div)
	},
}
