import { onnx } from '../onnx_importer.js'
import { loadTensor, loadAttribute } from '../utils.js'

import Matrix from '../../../../util/matrix.js'

/**
 * Handle gemm operator
 *
 * @module HandleONNXGemmOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#gemm
 */
export default {
	/**
	 * Import from onnx object.
	 *
	 * @param {onnx.ModelProto.AsObject} model Model object
	 * @param {onnx.NodeProto.AsObject} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		const attrs = {}
		for (const attribute of node.attributeList) {
			attrs[attribute.name] = loadAttribute(attribute)
		}
		attrs.alpha ??= 1
		attrs.beta ??= 1
		const layers = []
		let inputName = node.inputList[0]
		if (attrs.transA) {
			layers.push({ type: 'transpose', input: [inputName], name: (inputName += '_t'), axis: [1, 0] })
		}
		const initializers = {}
		for (const initializer of model.graph.initializerList) {
			if (initializer.name === node.inputList[1]) {
				initializers.w = Matrix.fromArray(loadTensor(initializer))
				if (attrs.transB) {
					initializers.w = initializers.w.t
				}
				initializers.w.mult(attrs.alpha)
				initializers.w = initializers.w.toArray()
			} else if (initializer.name === node.inputList[2]) {
				const b = loadTensor(initializer)
				if (!Array.isArray(b) || Array.isArray(b[0])) {
					initializers.b = Matrix.fromArray(b)
				} else {
					initializers.b = new Matrix(1, b.length, b)
				}
				initializers.b.mult(attrs.beta)
				initializers.b = initializers.b.toArray()
			}
		}
		layers.push({
			type: 'full',
			input: [inputName],
			name: node.outputList[0],
			w: initializers.w,
			b: initializers.b,
		})
		return layers
	},
}
