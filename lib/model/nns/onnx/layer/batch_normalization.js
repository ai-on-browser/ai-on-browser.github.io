import { onnx } from '../onnx_exporter.js'

/**
 * Handle batch normalization layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'batch_normalization'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 */
	export(model, obj, info) {
		const graph = model.getGraph()
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const size = info[input].size.concat()

		const node = new onnx.NodeProto()
		node.setOpType('BatchNormalization')
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
			node.addOutput(`${obj.name}_ap`)

			const node_transpose2 = new onnx.NodeProto()
			node_transpose2.setOpType('Transpose')
			node_transpose2.addInput(`${obj.name}_ap`)
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
		const attrTrainingMode = new onnx.AttributeProto()
		attrTrainingMode.setName('training_mode')
		attrTrainingMode.setType(onnx.AttributeProto.AttributeType.INT)
		attrTrainingMode.setI(0)
		node.addAttribute(attrTrainingMode)

		const channelDim = obj.channel_dim === 1 ? 1 : size.length - 1
		if (typeof obj.scale === 'string') {
			node.addInput(obj.scale)
		} else {
			if (!Array.isArray(obj.scale) && size[channelDim] == null) {
				throw new Error('Size of channel dim must be specified if scale is scalar.')
			}
			const scale = Array.isArray(obj.scale) ? obj.scale : Array(size[channelDim]).fill(obj.scale ?? 1)
			const tensor_scale = new onnx.TensorProto()
			tensor_scale.setName(`${obj.name}_scale`)
			tensor_scale.setDataType(onnx.TensorProto.DataType.FLOAT)
			tensor_scale.setDimsList([scale.length])
			tensor_scale.setFloatDataList(scale)
			graph.addInitializer(tensor_scale)
			node.addInput(`${obj.name}_scale`)
		}

		if (typeof obj.offset === 'string') {
			node.addInput(obj.offset)
		} else {
			if (!Array.isArray(obj.offset) && size[channelDim] == null) {
				throw new Error('Size of channel dim must be specified if offset is scalar.')
			}
			const offset = Array.isArray(obj.offset) ? obj.offset : Array(size[channelDim]).fill(obj.offset ?? 0)
			const tensor_offset = new onnx.TensorProto()
			tensor_offset.setName(`${obj.name}_offset`)
			tensor_offset.setDataType(onnx.TensorProto.DataType.FLOAT)
			tensor_offset.setDimsList([offset.length])
			tensor_offset.setFloatDataList(offset)
			graph.addInitializer(tensor_offset)
			node.addInput(`${obj.name}_offset`)
		}

		let tensor_axis = null
		const readyReduceAxisTensor = () => {
			if (tensor_axis) {
				return
			}
			const axis = Array.from(size, (_, i) => i)
			axis.splice(channelDim, 1)
			tensor_axis = new onnx.TensorProto()
			tensor_axis.setName(`${obj.name}_reduce_axis`)
			tensor_axis.setDataType(onnx.TensorProto.DataType.INT64)
			tensor_axis.setDimsList([axis.length])
			tensor_axis.setInt64DataList(axis)
			graph.addInitializer(tensor_axis)
		}
		if (typeof obj.input_mean === 'string') {
			node.addInput(obj.input_mean)
		} else if (obj.input_mean) {
			const tensor_input_mean = new onnx.TensorProto()
			tensor_input_mean.setName(`${obj.name}_input_mean`)
			tensor_input_mean.setDataType(onnx.TensorProto.DataType.FLOAT)
			tensor_input_mean.setDimsList([obj.input_mean.length])
			tensor_input_mean.setFloatDataList(obj.input_mean)
			graph.addInitializer(tensor_input_mean)
			node.addInput(`${obj.name}_input_mean`)
		} else {
			readyReduceAxisTensor()
			const node_reduce_mean = new onnx.NodeProto()
			node_reduce_mean.setOpType('ReduceMean')
			node_reduce_mean.addInput(input)
			node_reduce_mean.addInput(`${obj.name}_reduce_axis`)
			node_reduce_mean.addOutput(`${obj.name}_input_mean`)
			const attrKeepdims = new onnx.AttributeProto()
			attrKeepdims.setName('keepdims')
			attrKeepdims.setType(onnx.AttributeProto.AttributeType.INT)
			attrKeepdims.setI(0)
			node_reduce_mean.addAttribute(attrKeepdims)
			graph.addNode(node_reduce_mean)
			node.addInput(`${obj.name}_input_mean`)
		}

		if (typeof obj.input_var === 'string') {
			node.addInput(obj.input_var)
		} else if (obj.input_var) {
			const tensor_input_var = new onnx.TensorProto()
			tensor_input_var.setName(`${obj.name}_input_var`)
			tensor_input_var.setDataType(onnx.TensorProto.DataType.FLOAT)
			tensor_input_var.setDimsList([obj.input_var.length])
			tensor_input_var.setFloatDataList(obj.input_var)
			graph.addInitializer(tensor_input_var)
			node.addInput(`${obj.name}_input_var`)
		} else {
			readyReduceAxisTensor()
			const attrKeepdims = new onnx.AttributeProto()
			attrKeepdims.setName('keepdims')
			attrKeepdims.setType(onnx.AttributeProto.AttributeType.INT)
			attrKeepdims.setI(0)

			const node_reduce_mean1 = new onnx.NodeProto()
			node_reduce_mean1.setOpType('ReduceMean')
			node_reduce_mean1.addInput(input)
			node_reduce_mean1.addInput(`${obj.name}_reduce_axis`)
			node_reduce_mean1.addOutput(`${obj.name}_input_var_mean`)
			graph.addNode(node_reduce_mean1)
			const node_sub = new onnx.NodeProto()
			node_sub.setOpType('Sub')
			node_sub.addInput(input)
			node_sub.addInput(`${obj.name}_input_var_mean`)
			node_sub.addOutput(`${obj.name}_input_var_sub`)
			graph.addNode(node_sub)
			const node_mul = new onnx.NodeProto()
			node_mul.setOpType('Mul')
			node_mul.addInput(`${obj.name}_input_var_sub`)
			node_mul.addInput(`${obj.name}_input_var_sub`)
			node_mul.addOutput(`${obj.name}_input_var_mul`)
			graph.addNode(node_mul)
			const node_reduce_mean2 = new onnx.NodeProto()
			node_reduce_mean2.setOpType('ReduceMean')
			node_reduce_mean2.addInput(`${obj.name}_input_var_mul`)
			node_reduce_mean2.addInput(`${obj.name}_reduce_axis`)
			node_reduce_mean2.addOutput(`${obj.name}_input_var`)
			node_reduce_mean2.addAttribute(attrKeepdims)
			graph.addNode(node_reduce_mean2)
			node.addInput(`${obj.name}_input_var`)
		}

		graph.addNode(node)
	},
}
