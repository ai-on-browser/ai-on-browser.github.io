import { onnx } from '../onnx_exporter.js'

/**
 * Handle std layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'std'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj, info) {
		const graph = model.getGraph()

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_mean = new onnx.NodeProto()
		node_mean.setOpType('ReduceMean')
		node_mean.addInput(input)
		node_mean.addOutput(`${obj.name}_mean`)

		const attrKeepdims = new onnx.AttributeProto()
		attrKeepdims.setName('keepdims')
		attrKeepdims.setType(onnx.AttributeProto.AttributeType.INT)
		attrKeepdims.setI(1)
		node_mean.addAttribute(attrKeepdims)

		const node_sub = new onnx.NodeProto()
		node_sub.setOpType('Sub')
		node_sub.addInput(input)
		node_sub.addInput(`${obj.name}_mean`)
		node_sub.addOutput(`${obj.name}_sub`)

		const node_mul = new onnx.NodeProto()
		node_mul.setOpType('Mul')
		node_mul.addInput(`${obj.name}_sub`)
		node_mul.addInput(`${obj.name}_sub`)
		node_mul.addOutput(`${obj.name}_mul`)

		const node_variance = new onnx.NodeProto()
		node_variance.setOpType('ReduceMean')
		node_variance.addInput(`${obj.name}_mul`)
		node_variance.addOutput(`${obj.name}_var`)

		const keepdims = (obj.keepdims ?? true) ? 1 : 0
		const attrKeepdims2 = new onnx.AttributeProto()
		attrKeepdims2.setName('keepdims')
		attrKeepdims2.setType(onnx.AttributeProto.AttributeType.INT)
		attrKeepdims2.setI(keepdims)
		node_variance.addAttribute(attrKeepdims2)

		const node_sqrt = new onnx.NodeProto()
		node_sqrt.setOpType('Sqrt')
		node_sqrt.addInput(`${obj.name}_var`)
		node_sqrt.addOutput(obj.name)

		graph.addNode(node_mean)
		graph.addNode(node_sub)
		graph.addNode(node_mul)
		graph.addNode(node_variance)
		graph.addNode(node_sqrt)

		const size = info[input].size.concat()
		if (typeof obj.axis === 'string') {
			throw new Error('Unsupported axis type string')
		} else if (obj.axis == null || (typeof obj.axis === 'number' && obj.axis < 0)) {
			return { size: keepdims ? Array(size.length).fill(1) : [] }
		}
		const axis = Array.isArray(obj.axis) ? obj.axis : [obj.axis]
		const tensor_axis = new onnx.TensorProto()
		tensor_axis.setName(`${obj.name}_axis`)
		tensor_axis.setDataType(onnx.TensorProto.DataType.INT64)
		tensor_axis.setDimsList([axis.length])
		tensor_axis.setInt64DataList(axis)
		graph.addInitializer(tensor_axis)
		node_mean.addInput(`${obj.name}_axis`)
		node_variance.addInput(`${obj.name}_axis`)

		axis.sort((a, b) => b - a)
		if (keepdims) {
			for (const i of axis) {
				size[i] = 1
			}
		} else {
			for (const i of axis) {
				size.splice(i, 1)
			}
		}
		return { size }
	},
}
