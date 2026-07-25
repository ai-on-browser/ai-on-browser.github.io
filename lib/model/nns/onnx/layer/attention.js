import Matrix from '../../../../util/matrix.js'
import { onnx } from '../onnx_exporter.js'

/**
 * Handle attention layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'attention'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj, info) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const memory = Array.isArray(obj.input) ? (obj.input[1] ?? obj.input[0]) : obj.input
		const graph = model.getGraph()

		const node_q = new onnx.NodeProto()
		node_q.setOpType('MatMul')
		node_q.addInput(input)
		if (typeof obj.wq === 'string') {
			node_q.addInput(obj.wq)
		} else if (obj.wq) {
			const wname = `${obj.name}_wq`
			node_q.addInput(wname)
			const tensor = new onnx.TensorProto()
			tensor.setName(wname)
			tensor.setDataType(onnx.TensorProto.DataType.FLOAT)
			const w = Matrix.fromArray(obj.wq)
			tensor.setDimsList(w.sizes)
			tensor.setFloatDataList(w.value)
			graph.addInitializer(tensor)
		} else {
			throw new Error(`Require attribute 'wq'`)
		}
		node_q.addOutput(`${obj.name}_q`)
		graph.addNode(node_q)

		const node_k = new onnx.NodeProto()
		node_k.setOpType('MatMul')
		node_k.addInput(memory)
		if (typeof obj.wk === 'string') {
			node_k.addInput(obj.wk)
		} else if (obj.wk) {
			const wname = `${obj.name}_wk`
			node_k.addInput(wname)
			const tensor = new onnx.TensorProto()
			tensor.setName(wname)
			tensor.setDataType(onnx.TensorProto.DataType.FLOAT)
			const w = Matrix.fromArray(obj.wk)
			tensor.setDimsList(w.sizes)
			tensor.setFloatDataList(w.value)
			graph.addInitializer(tensor)
		} else {
			throw new Error(`Require attribute 'wk'`)
		}
		node_k.addOutput(`${obj.name}_k`)
		graph.addNode(node_k)

		const node_v = new onnx.NodeProto()
		node_v.setOpType('MatMul')
		node_v.addInput(memory)
		if (typeof obj.wv === 'string') {
			node_v.addInput(obj.wv)
		} else if (obj.wv) {
			const wname = `${obj.name}_wv`
			node_v.addInput(wname)
			const tensor = new onnx.TensorProto()
			tensor.setName(wname)
			tensor.setDataType(onnx.TensorProto.DataType.FLOAT)
			const w = Matrix.fromArray(obj.wv)
			tensor.setDimsList(w.sizes)
			tensor.setFloatDataList(w.value)
			graph.addInitializer(tensor)
		} else {
			throw new Error(`Require attribute 'wv'`)
		}
		node_v.addOutput(`${obj.name}_v`)
		graph.addNode(node_v)

		const opset = model.getOpsetImportList()[0]
		if (opset.getDomain() === '' && opset.getVersion() >= 23) {
			const node = new onnx.NodeProto()
			node.setOpType('Attention')
			node.addInput(`${obj.name}_q`)
			node.addInput(`${obj.name}_k`)
			node.addInput(`${obj.name}_v`)

			const attrKvNumHeads = new onnx.AttributeProto()
			attrKvNumHeads.setName('kv_num_heads')
			attrKvNumHeads.setType(onnx.AttributeProto.AttributeType.INT)
			attrKvNumHeads.setI(1)
			node.addAttribute(attrKvNumHeads)
			const attrQNumHeads = new onnx.AttributeProto()
			attrQNumHeads.setName('q_num_heads')
			attrQNumHeads.setType(onnx.AttributeProto.AttributeType.INT)
			attrQNumHeads.setI(1)
			node.addAttribute(attrQNumHeads)

			node.addOutput(obj.name)
			graph.addNode(node)
		} else {
			const node_einsum = new onnx.NodeProto()
			node_einsum.setOpType('Einsum')
			node_einsum.addInput(`${obj.name}_q`)
			node_einsum.addInput(`${obj.name}_k`)
			const attrEquation = new onnx.AttributeProto()
			attrEquation.setName('equation')
			attrEquation.setType(onnx.AttributeProto.AttributeType.STRING)
			attrEquation.setS(new TextEncoder().encode('bij, bkj -> bik'))
			node_einsum.addAttribute(attrEquation)
			node_einsum.addOutput(`${obj.name}_qk`)
			graph.addNode(node_einsum)

			const node_shape = new onnx.NodeProto()
			node_shape.setOpType('Shape')
			node_shape.addInput(`${obj.name}_qk`)
			node_shape.addOutput(`${obj.name}_shape`)
			graph.addNode(node_shape)

			const node1 = new onnx.NodeProto()
			node1.setOpType('Constant')
			const attrValue1 = new onnx.AttributeProto()
			attrValue1.setName('value')
			attrValue1.setType(onnx.AttributeProto.AttributeType.INT)
			attrValue1.setI(1)
			node1.addAttribute(attrValue1)
			node1.addOutput(`${obj.name}_const1`)
			graph.addNode(node1)

			const node_n1 = new onnx.NodeProto()
			node_n1.setOpType('Constant')
			const attrValuen1 = new onnx.AttributeProto()
			attrValuen1.setName('value')
			attrValuen1.setType(onnx.AttributeProto.AttributeType.INT)
			attrValuen1.setI(-1)
			node_n1.addAttribute(attrValuen1)
			node_n1.addOutput(`${obj.name}_const-1`)
			graph.addNode(node_n1)

			const node_sts = new onnx.NodeProto()
			node_sts.setOpType('SplitToSequence')
			node_sts.addInput(`${obj.name}_shape`)
			node_sts.addInput(`${obj.name}_const1`)
			node_sts.addOutput(`${obj.name}_sts`)
			graph.addNode(node_sts)

			const node_sa = new onnx.NodeProto()
			node_sa.setOpType('SequenceAt')
			node_sa.addInput(`${obj.name}_sts`)
			node_sa.addInput(`${obj.name}_const-1`)
			node_sa.addOutput(`${obj.name}_sa`)
			graph.addNode(node_sa)

			const castnode = new onnx.NodeProto()
			castnode.setOpType('Cast')
			castnode.addInput(`${obj.name}_sa`)
			castnode.addOutput(`${obj.name}_cast`)
			const to = new onnx.AttributeProto()
			to.setName('to')
			to.setType(onnx.AttributeProto.AttributeType.INT)
			to.setI(onnx.TensorProto.DataType.FLOAT)
			castnode.addAttribute(to)
			graph.addNode(castnode)

			const node_sqrt = new onnx.NodeProto()
			node_sqrt.setOpType('Sqrt')
			node_sqrt.addInput(`${obj.name}_cast`)
			node_sqrt.addOutput(`${obj.name}_sqrt`)
			graph.addNode(node_sqrt)

			const node_div = new onnx.NodeProto()
			node_div.setOpType('Div')
			node_div.addInput(`${obj.name}_qk`)
			node_div.addInput(`${obj.name}_sqrt`)
			node_div.addOutput(`${obj.name}_div`)
			graph.addNode(node_div)

			const node_softmax = new onnx.NodeProto()
			node_softmax.setOpType('Softmax')
			node_softmax.addInput(`${obj.name}_div`)
			node_softmax.addOutput(`${obj.name}_softmax`)
			graph.addNode(node_softmax)

			const node_einsum2 = new onnx.NodeProto()
			node_einsum2.setOpType('Einsum')
			node_einsum2.addInput(`${obj.name}_softmax`)
			node_einsum2.addInput(`${obj.name}_v`)
			const attrEquation2 = new onnx.AttributeProto()
			attrEquation2.setName('equation')
			attrEquation2.setType(onnx.AttributeProto.AttributeType.STRING)
			attrEquation2.setS(new TextEncoder().encode('bij, bjk -> bik'))
			node_einsum2.addAttribute(attrEquation2)
			node_einsum2.addOutput(obj.name)
			graph.addNode(node_einsum2)
		}
		return { size: info[input].size }
	},
}
