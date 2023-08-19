import { onnx } from '../onnx_exporter.js'

import Tensor from '../../../../util/tensor.js'

/**
 * Handle const layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'const'}} obj Node object
	 */
	export(model, obj) {
		const node = new onnx.NodeProto()
		node.setOpType('Constant')

		const tensor = new onnx.TensorProto()
		tensor.setDataType(onnx.TensorProto.DataType.FLOAT)
		const w = Tensor.fromArray(obj.value)
		tensor.setDimsList(w.sizes)
		tensor.setFloatDataList(w.value)
		const attrValue = new onnx.AttributeProto()
		attrValue.setName('value')
		attrValue.setType(onnx.AttributeProto.AttributeType.TENSOR)
		attrValue.setT(tensor)
		node.addAttribute(attrValue)

		node.addOutput(obj.name)

		const graph = model.getGraph()
		graph.addNode(node)
	},
}
