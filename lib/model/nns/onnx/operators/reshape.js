import { onnx } from '../onnx_importer.js'
import { loadTensor, loadAttribute, requireTensor } from '../utils.js'

/**
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#reshape
 */
export default {
	/**
	 * Import fron onnx object.
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
				initializers.shape = loadTensor(initializer)
			}
		}
		if (initializers.shape[0] === -1) {
			initializers.shape = initializers.shape.slice(1)
		} else if (initializers.shape.some(v => v === -1)) {
			throw new Error(`Invalid shape value ${JSON.stringify(initializers.shape)}.`)
		}
		return [
			...requireTensor(model, node.inputList[0]),
			{
				type: 'reshape',
				input: [node.inputList[0]],
				name: node.outputList[0],
				size: initializers.shape,
			},
		]
	},
}
