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
		const attrs = { alpha: 1, beta: 1 }
		for (const attribute of node.attributeList) {
			attrs[attribute.name] = loadAttribute(attribute)
		}
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
		let weightName = node.inputList[1]
		if (!initializers.w) {
			if (attrs.transB) {
				layers.push({ type: 'transpose', input: [weightName], name: node.inputList[1] + '_t', axis: [1, 0] })
				weightName = node.inputList[1] + '_t'
			}
			if (attrs.alpha !== 1) {
				layers.push({ type: 'const', value: [attrs.alpha], name: node.inputList[1] + '_alpha' })
				layers.push({
					type: 'mult',
					input: [weightName, node.inputList[1] + '_alpha'],
					name: node.inputList[1] + '_mul_a',
				})
				weightName = node.inputList[1] + '_mul_a'
			}
		}
		let biasName = node.inputList[2]
		if (biasName && !initializers.b) {
			if (attrs.beta !== 1) {
				layers.push({ type: 'const', value: [attrs.beta], name: node.inputList[2] + '_beta' })
				layers.push({
					type: 'mult',
					input: [biasName, node.inputList[2] + '_beta'],
					name: node.inputList[2] + '_mul_b',
				})
				biasName = node.inputList[2] + '_mul_b'
			}
		}
		layers.push({
			type: 'full',
			input: [inputName],
			name: node.outputList[0],
			w: initializers.w || weightName,
			b: initializers.b || biasName,
		})
		return layers
	},
}
