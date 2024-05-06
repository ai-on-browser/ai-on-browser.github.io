import { onnx } from '../onnx_importer.js'
import { loadTensor, loadAttribute } from '../utils.js'

import Matrix from '../../../../util/matrix.js'

/**
 * Handle gemm operator
 * @module HandleONNXGemmOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#gemm
 */
export default {
	/**
	 * Import from onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.NodeProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		const attrs = { alpha: 1, beta: 1 }
		for (const attribute of node.getAttributeList()) {
			attrs[attribute.getName()] = loadAttribute(attribute)
		}
		const inputList = node.getInputList()
		const layers = []
		let inputName = inputList[0]
		if (attrs.transA) {
			layers.push({ type: 'transpose', input: [inputName], name: (inputName += '_t'), axis: [1, 0] })
		}
		const initializers = {}
		for (const initializer of model.getGraph().getInitializerList()) {
			if (initializer.getName() === inputList[1]) {
				initializers.w = Matrix.fromArray(loadTensor(initializer))
				if (attrs.transB) {
					initializers.w = initializers.w.t
				}
				initializers.w.mult(attrs.alpha)
				initializers.w = initializers.w.toArray()
			} else if (initializer.getName() === inputList[2]) {
				const b = loadTensor(initializer)
				if (!Array.isArray(b)) {
					initializers.b = b * attrs.beta
				} else if (!Array.isArray(b[0])) {
					initializers.b = [b.map(v => v * attrs.beta)]
				} else {
					initializers.b = Matrix.fromArray(b)
					initializers.b.mult(attrs.beta)
					initializers.b = initializers.b.toArray()
				}
			}
		}
		let weightName = inputList[1]
		if (!initializers.w) {
			if (attrs.transB) {
				layers.push({ type: 'transpose', input: [weightName], name: inputList[1] + '_t', axis: [1, 0] })
				weightName = inputList[1] + '_t'
			}
			if (attrs.alpha !== 1) {
				layers.push({ type: 'const', value: [attrs.alpha], name: inputList[1] + '_alpha' })
				layers.push({
					type: 'mult',
					input: [weightName, inputList[1] + '_alpha'],
					name: inputList[1] + '_mul_a',
				})
				weightName = inputList[1] + '_mul_a'
			}
		}
		let biasName = inputList[2]
		if (biasName && !initializers.b) {
			if (attrs.beta !== 1) {
				layers.push({ type: 'const', value: [attrs.beta], name: inputList[2] + '_beta' })
				layers.push({
					type: 'mult',
					input: [biasName, inputList[2] + '_beta'],
					name: inputList[2] + '_mul_b',
				})
				biasName = inputList[2] + '_mul_b'
			}
		}
		layers.push({
			type: 'full',
			input: [inputName],
			name: node.getOutputList()[0],
			w: initializers.w || weightName,
			b: initializers.b || biasName,
		})
		return layers
	},
}
