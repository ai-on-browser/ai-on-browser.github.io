import { onnx } from '../onnx_importer.js'
import { loadTensor } from '../utils.js'

/**
 * Handle pow operator
 * @module HandleONNXPowOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#Pow
 */
export default {
	/**
	 * Import from onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.NodeProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		const inputList = node.getInputList()
		const initializers = {}
		for (const initializer of model.getGraph().getInitializerList()) {
			if (initializer.getName() === inputList[1]) {
				initializers.exponent = loadTensor(initializer)
			}
		}
		const layers = []
		if (initializers.exponent) {
			layers.push({ type: 'const', input: [], name: inputList[1], value: initializers.exponent })
		}
		layers.push({ type: 'power', input: inputList, name: node.getOutputList()[0] })
		return layers
	},
}
