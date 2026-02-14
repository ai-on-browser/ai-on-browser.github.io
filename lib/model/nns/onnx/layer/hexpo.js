import { onnx } from '../onnx_exporter.js'
import { getConstNodeName } from '../utils.js'

/**
 * Handle hexpo layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'hexpo'}} obj Node object
	 */
	export(model, obj) {
		const tensor0 = getConstNodeName(model, 0)
		const tensor_a = new onnx.TensorProto()
		tensor_a.setName(`${obj.name}_a`)
		tensor_a.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_a.setDimsList([1])
		tensor_a.setFloatDataList([obj.a ?? 1])
		const tensor_b = new onnx.TensorProto()
		tensor_b.setName(`${obj.name}_b`)
		tensor_b.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_b.setDimsList([1])
		tensor_b.setFloatDataList([obj.b ?? 1])
		const tensor_c = new onnx.TensorProto()
		tensor_c.setName(`${obj.name}_c`)
		tensor_c.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_c.setDimsList([1])
		tensor_c.setFloatDataList([obj.c ?? 1])
		const tensor_d = new onnx.TensorProto()
		tensor_d.setName(`${obj.name}_d`)
		tensor_d.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_d.setDimsList([1])
		tensor_d.setFloatDataList([obj.d ?? 1])

		const node_nega = new onnx.NodeProto()
		node_nega.setOpType('Neg')
		node_nega.addInput(`${obj.name}_a`)
		node_nega.addOutput(`${obj.name}_-a`)

		const node_negb = new onnx.NodeProto()
		node_negb.setOpType('Neg')
		node_negb.addInput(`${obj.name}_b`)
		node_negb.addOutput(`${obj.name}_-b`)

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_posneg = new onnx.NodeProto()
		node_posneg.setOpType('GreaterOrEqual')
		node_posneg.addInput(input)
		node_posneg.addInput(tensor0)
		node_posneg.addOutput(`${obj.name}_posneg`)

		const node_where1 = new onnx.NodeProto()
		node_where1.setOpType('Where')
		node_where1.addInput(`${obj.name}_posneg`)
		node_where1.addInput(`${obj.name}_-b`)
		node_where1.addInput(`${obj.name}_d`)
		node_where1.addOutput(`${obj.name}_where1`)

		const node_div = new onnx.NodeProto()
		node_div.setOpType('Div')
		node_div.addInput(input)
		node_div.addInput(`${obj.name}_where1`)
		node_div.addOutput(`${obj.name}_div`)

		const node_elu = new onnx.NodeProto()
		node_elu.setOpType('Elu')
		node_elu.addInput(`${obj.name}_div`)
		node_elu.addOutput(`${obj.name}_elu`)

		const node_where2 = new onnx.NodeProto()
		node_where2.setOpType('Where')
		node_where2.addInput(`${obj.name}_posneg`)
		node_where2.addInput(`${obj.name}_-a`)
		node_where2.addInput(`${obj.name}_c`)
		node_where2.addOutput(`${obj.name}_where2`)

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(`${obj.name}_elu`)
		node_mul.addInput(`${obj.name}_where2`)
		node_mul.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_a)
		graph.addInitializer(tensor_b)
		graph.addInitializer(tensor_c)
		graph.addInitializer(tensor_d)
		graph.addNode(node_nega)
		graph.addNode(node_negb)
		graph.addNode(node_posneg)
		graph.addNode(node_where1)
		graph.addNode(node_div)
		graph.addNode(node_elu)
		graph.addNode(node_where2)
		graph.addNode(node_mul)
	},
}
