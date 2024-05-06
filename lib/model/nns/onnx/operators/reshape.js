import { onnx } from '../onnx_importer.js'
import { loadTensor, loadAttribute, requireTensor } from '../utils.js'

/**
 * Handle reshape operator
 * @module HandleONNXReshapeOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#reshape
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
				initializers.shape = loadTensor(initializer)
			}
		}
		if (initializers.shape[0] === -1) {
			initializers.shape = initializers.shape.slice(1)
		} else if (initializers.shape.some(v => v === -1)) {
			throw new Error(`Invalid shape value ${JSON.stringify(initializers.shape)}.`)
		}
		return [
			...requireTensor(model, inputList[0]),
			{
				type: 'reshape',
				input: [inputList[0]],
				name: node.getOutputList()[0],
				size: initializers.shape,
			},
		]
	},
}
