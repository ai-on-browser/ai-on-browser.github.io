import { onnx } from '../onnx_importer.js'
import { loadAttribute, loadTensor } from '../utils.js'

/**
 * Handle dropout operator
 *
 * @module HandleONNXDropoutOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#Dropout
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
		const initializers = {}
		for (const initializer of model.graph.initializerList) {
			if (initializer.name === node.inputList[1]) {
				initializers.ratio = loadTensor(initializer)
			} else if (initializer.name === node.inputList[2]) {
				initializers.training_mode = loadTensor(initializer)
			}
		}
		return [
			{ type: 'dropout', input: [node.inputList[0]], name: node.outputList[0], drop_rate: initializers.ratio },
		]
	},
}
