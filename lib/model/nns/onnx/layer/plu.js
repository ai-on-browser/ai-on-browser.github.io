import { onnx } from '../onnx_exporter.js'

/**
 * Handle plu layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'plu'}} obj Node object
	 */
	export(model, obj) {
		const tensor_alpha = new onnx.TensorProto()
		tensor_alpha.setName(obj.name + '_alpha')
		tensor_alpha.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_alpha.setDimsList([1])
		tensor_alpha.setFloatDataList([obj.alpha ?? 0.1])
		const tensor_c = new onnx.TensorProto()
		tensor_c.setName(obj.name + '_c')
		tensor_c.setDataType(onnx.TensorProto.DataType.FLOAT)
		tensor_c.setDimsList([1])
		tensor_c.setFloatDataList([obj.c ?? 1])

		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const node_lb_add = new onnx.NodeProto()
		node_lb_add.setOpType('Add')
		node_lb_add.addInput(input)
		node_lb_add.addInput(obj.name + '_c')
		node_lb_add.addOutput(obj.name + '_lb_add')

		const node_lb_mul = new onnx.NodeProto()
		node_lb_mul.setOpType('Mul')
		node_lb_mul.addInput(obj.name + '_lb_add')
		node_lb_mul.addInput(obj.name + '_alpha')
		node_lb_mul.addOutput(obj.name + '_lb_mul')

		const node_lb = new onnx.NodeProto()
		node_lb.setOpType('Sub')
		node_lb.addInput(obj.name + '_lb_mul')
		node_lb.addInput(obj.name + '_c')
		node_lb.addOutput(obj.name + '_lb')

		const node_ub_sub = new onnx.NodeProto()
		node_ub_sub.setOpType('Sub')
		node_ub_sub.addInput(input)
		node_ub_sub.addInput(obj.name + '_c')
		node_ub_sub.addOutput(obj.name + '_ub_sub')

		const node_ub_mul = new onnx.NodeProto()
		node_ub_mul.setOpType('Mul')
		node_ub_mul.addInput(obj.name + '_ub_sub')
		node_ub_mul.addInput(obj.name + '_alpha')
		node_ub_mul.addOutput(obj.name + '_ub_mul')

		const node_ub = new onnx.NodeProto()
		node_ub.setOpType('Add')
		node_ub.addInput(obj.name + '_ub_mul')
		node_ub.addInput(obj.name + '_c')
		node_ub.addOutput(obj.name + '_ub')

		const node_min = new onnx.NodeProto()
		node_min.setOpType('Min')
		node_min.addInput(input)
		node_min.addInput(obj.name + '_ub')
		node_min.addOutput(obj.name + '_min')

		const node_max = new onnx.NodeProto()
		node_max.setOpType('Max')
		node_max.addInput(obj.name + '_min')
		node_max.addInput(obj.name + '_lb')
		node_max.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addInitializer(tensor_alpha)
		graph.addInitializer(tensor_c)
		graph.addNode(node_lb_add)
		graph.addNode(node_lb_mul)
		graph.addNode(node_lb)
		graph.addNode(node_ub_sub)
		graph.addNode(node_ub_mul)
		graph.addNode(node_ub)
		graph.addNode(node_min)
		graph.addNode(node_max)
	},
}
