import { onnx } from '../onnx_importer.js'
import { loadTensor } from '../utils.js'

/**
 * Handle prelu operator
 *
 * @module HandleONNXPReluOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#PRelu
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
		const inputList = node.getInputList()
		const initializers = {}
		for (const initializer of model.getGraph().getInitializerList()) {
			if (initializer.getName() === inputList[1]) {
				initializers.slope = loadTensor(initializer)
			}
		}
		return [
			{
				type: 'prelu',
				input: [inputList[0]],
				name: node.getOutputList()[0],
				a: initializers.slope || inputList[1],
			},
		]
	},
}
