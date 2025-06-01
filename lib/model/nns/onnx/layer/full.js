import { onnx } from '../onnx_exporter.js'

import Matrix from '../../../../util/matrix.js'
import ONNXExporter from '../onnx_exporter.js'

/**
 * Handle full layer
 */
export default {
	/**
	 * Export to onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {import("../../graph").LayerObject & {type: 'full'}} obj Node object
	 * @param {{[key: string]: {type: onnx.TensorProto.DataType; size: number[]}}} info Output informatino of other layers
	 * @returns {{type: onnx.TensorProto.DataType; size: number[]}} Output information of this layer
	 */
	export(model, obj, info) {
		const input = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const graph = model.getGraph()
		const node = new onnx.NodeProto()
		node.setOpType('Gemm')
		node.addInput(input)

		let outSize = typeof obj.out_size === 'string' ? null : obj.out_size
		if (typeof obj.w === 'string') {
			node.addInput(obj.w)
		} else if (obj.w) {
			const wname = obj.name + '_w'
			node.addInput(wname)
			const tensor = new onnx.TensorProto()
			tensor.setName(wname)
			tensor.setDataType(onnx.TensorProto.DataType.FLOAT)
			const w = Matrix.fromArray(obj.w)
			tensor.setDimsList(w.sizes)
			tensor.setFloatDataList(w.value)
			graph.addInitializer(tensor)

			if (outSize == null) {
				outSize = w.sizes.at(-1)
			}
		} else {
			throw new Error(`Require attribute 'w'`)
		}
		if (typeof obj.b === 'string') {
			node.addInput(obj.b)
		} else {
			const bname = obj.name + '_b'
			node.addInput(bname)
			const tensor = new onnx.TensorProto()
			tensor.setName(bname)
			tensor.setDataType(onnx.TensorProto.DataType.FLOAT)
			if (obj.b) {
				const b = Matrix.fromArray(obj.b)
				tensor.setDimsList(b.sizes)
				tensor.setFloatDataList(b.value)
			} else {
				tensor.setDimsList([1, obj.out_size])
				tensor.setFloatDataList(Array(obj.out_size).fill(0))
			}
			graph.addInitializer(tensor)
		}
		graph.addNode(node)

		if (obj.activation) {
			const name = obj.name + '_a'
			node.addOutput(name)
			const aobj =
				typeof obj.activation === 'string'
					? { type: obj.activation, input: name, name: obj.name }
					: { ...obj.activation, input: name, name: obj.name }
			const exporter = ONNXExporter.getLayerExporter(aobj.type)
			exporter.export(model, aobj)
		} else {
			node.addOutput(obj.name)
		}

		const inputName = Array.isArray(obj.input) ? obj.input[0] : obj.input
		const size = info[inputName].size.concat()
		size[size.length - 1] = outSize
		return { size }
	},
}
