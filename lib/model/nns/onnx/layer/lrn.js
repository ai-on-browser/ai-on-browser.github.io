import { onnx } from '../onnx_exporter.js'

/**
 * Handle lrn layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph.js").LayerObject & {type: 'lrn'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 */
	export(model, obj, info) {
		const graph = model.getGraph()

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const size = info[input].size.concat()

		const node = new onnx.NodeProto()
		node.setOpType('LRN')
		if (obj.channel_dim === 1) {
			node.addInput(input)
			node.addOutput(obj.name)
		} else if (obj.channel_dim == null || obj.channel_dim === -1) {
			const node_transpose1 = new onnx.NodeProto()
			node_transpose1.setOpType('Transpose')
			node_transpose1.addInput(input)
			node_transpose1.addOutput(`${obj.name}_t1`)
			const attrPerm1 = new onnx.AttributeProto()
			attrPerm1.setName('perm')
			attrPerm1.setType(onnx.AttributeProto.AttributeType.INTS)
			const perm1 = Array.from(size, (_, i) => i - 1)
			perm1[0] = 0
			perm1[1] = size.length - 1
			attrPerm1.setIntsList(perm1)
			node_transpose1.addAttribute(attrPerm1)
			graph.addNode(node_transpose1)

			node.addInput(`${obj.name}_t1`)
			node.addOutput(`${obj.name}_gap`)

			const node_transpose2 = new onnx.NodeProto()
			node_transpose2.setOpType('Transpose')
			node_transpose2.addInput(`${obj.name}_gap`)
			node_transpose2.addOutput(obj.name)
			const attrPerm2 = new onnx.AttributeProto()
			attrPerm2.setName('perm')
			attrPerm2.setType(onnx.AttributeProto.AttributeType.INTS)
			const perm2 = Array.from(size, (_, i) => i + 1)
			perm2[0] = 0
			perm2[perm2.length - 1] = 1
			attrPerm2.setIntsList(perm2)
			node_transpose2.addAttribute(attrPerm2)
			graph.addNode(node_transpose2)
		} else {
			throw new Error(`Not implemented value of attribute 'channel_dim' ${obj.channel_dim}.`)
		}

		if (obj.n == null) {
			throw new Error("Require attribute 'n'")
		}
		const attrSize = new onnx.AttributeProto()
		attrSize.setName('size')
		attrSize.setType(onnx.AttributeProto.AttributeType.INT)
		attrSize.setI(obj.n)
		node.addAttribute(attrSize)

		const attrAlpha = new onnx.AttributeProto()
		attrAlpha.setName('alpha')
		attrAlpha.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrAlpha.setF(obj.alpha ?? 0.0001)
		node.addAttribute(attrAlpha)
		const attrBeta = new onnx.AttributeProto()
		attrBeta.setName('beta')
		attrBeta.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrBeta.setF(obj.beta ?? 0.75)
		node.addAttribute(attrBeta)
		const attrBias = new onnx.AttributeProto()
		attrBias.setName('bias')
		attrBias.setType(onnx.AttributeProto.AttributeType.FLOAT)
		attrBias.setF(obj.k ?? 2)
		node.addAttribute(attrBias)

		graph.addNode(node)
	},
}
