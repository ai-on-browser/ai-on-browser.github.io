import { onnx } from '../onnx_importer.js'
import { loadTensor } from '../utils.js'

/**
 * Handle pow operator
 *
 * @module HandleONNXPowOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#Pow
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
		const initializers = {}
		for (const initializer of model.graph.initializerList) {
			if (initializer.name === node.inputList[1]) {
				initializers.exponent = loadTensor(initializer)
			}
		}
		const layers = []
		if (initializers.exponent) {
			layers.push({ type: 'const', input: [], name: node.inputList[1], value: initializers.exponent })
		}
		layers.push({ type: 'power', input: node.inputList, name: node.outputList[0] })
		return layers
	},
}
