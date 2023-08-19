import { onnx } from '../onnx_exporter.js'

/**
 * Handle less layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'less'}} obj Node object
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj) {
		if (!Array.isArray(obj.input)) {
			throw new Error(`Invalid attribute 'input' value ${obj.input}.`)
		}
		const graph = model.getGraph()

		const node = new onnx.NodeProto()
		node.setOpType('Less')
		for (const i of obj.input) {
			node.addInput(i)
		}
		node.addOutput(obj.name)
		graph.addNode(node)
		return { type: onnx.TensorProto.DataType.BOOL }
	},
}
