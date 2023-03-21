import { onnx } from '../onnx_importer.js'
import { loadAttribute, loadTensor } from '../utils.js'

/**
 * Handle reduce min operator
 *
 * @module HandleONNXReduceMinOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#ReduceMin
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
		const attrs = { keepdims: 1, noop_with_empty_axes: 0 }
		for (const attribute of node.attributeList) {
			attrs[attribute.name] = loadAttribute(attribute)
		}
		if (attrs.noop_with_empty_axes !== 0) {
			throw new Error(`Invalid noop_with_empty_axes value ${attrs.noop_with_empty_axes}.`)
		}
		const initializers = {}
		for (const initializer of model.graph.initializerList) {
			if (initializer.name === node.inputList[1]) {
				initializers.axis = loadTensor(initializer)
			}
		}
		return [
			{
				type: 'reduce_min',
				input: [node.inputList[0]],
				name: node.outputList[0],
				axis: initializers.axis || node.inputList[1] || -1,
				keepdims: !!attrs.keepdims,
			},
		]
	},
}
