import { onnx } from '../onnx_importer.js'
import { loadAttribute, loadTensor } from '../utils.js'

/**
 * Handle reduce log sum exp operator
 *
 * @module HandleONNXReduceLogSumExpOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#ReduceLogSumExp
 */
export default {
	/**
	 * Import from onnx object.
	 *
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.NodeProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		const attrs = { keepdims: 1, noop_with_empty_axes: 0 }
		for (const attribute of node.getAttributeList()) {
			attrs[attribute.getName()] = loadAttribute(attribute)
		}
		if (attrs.noop_with_empty_axes !== 0) {
			throw new Error(`Invalid noop_with_empty_axes value ${attrs.noop_with_empty_axes}.`)
		}
		const inputList = node.getInputList()
		const initializers = {}
		for (const initializer of model.getGraph().getInitializerList()) {
			if (initializer.getName() === inputList[1]) {
				initializers.axis = loadTensor(initializer)
			}
		}
		return [
			{ type: 'exp', input: [inputList[0]] },
			{ type: 'sum', axis: initializers.axis || inputList[1] || -1, keepdims: !!attrs.keepdims },
			{ type: 'log', name: node.getOutputList()[0] },
		]
	},
}
