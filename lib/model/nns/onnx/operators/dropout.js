import { onnx } from '../onnx_importer.js'
import { loadAttribute, loadTensor } from '../utils.js'

/**
 * Handle dropout operator
 * @module HandleONNXDropoutOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#Dropout
 */
export default {
	/**
	 * Import from onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.NodeProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		const attrs = {}
		for (const attribute of node.getAttributeList()) {
			attrs[attribute.getName()] = loadAttribute(attribute)
		}
		const inputList = node.getInputList()
		const initializers = {}
		for (const initializer of model.getGraph().getInitializerList()) {
			if (initializer.getName() === inputList[1]) {
				initializers.ratio = loadTensor(initializer)
			} else if (initializer.getName() === inputList[2]) {
				initializers.training_mode = loadTensor(initializer)
			}
		}
		return [
			{ type: 'dropout', input: [inputList[0]], name: node.getOutputList()[0], drop_rate: initializers.ratio },
		]
	},
}
