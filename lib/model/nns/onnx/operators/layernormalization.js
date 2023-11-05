import { onnx } from '../onnx_importer.js'
import { loadTensor, loadAttribute } from '../utils.js'

/**
 * Handle layer-normalization operator
 *
 * @module HandleONNXLayerNormalizationOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#LayerNormalization
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
		const attrs = { axis: -1, epsilon: 1e-5 }
		for (const attribute of node.getAttributeList()) {
			attrs[attribute.getName()] = loadAttribute(attribute)
		}
		const inputList = node.getInputList()
		const initializers = {}
		for (const initializer of model.getGraph().getInitializerList()) {
			if (initializer.getName() === inputList[1]) {
				initializers.scale = loadTensor(initializer)
			} else if (initializer.getName() === inputList[2]) {
				initializers.b = loadTensor(initializer)
			}
		}
		return [
			{
				type: 'layer_normalization',
				input: [inputList[0]],
				name: node.getOutputList()[0],
				scale: initializers.scale ?? inputList[1],
				offset: initializers.b ?? inputList[2],
				epsilon: attrs.epsilon ?? 1.0e-5,
				axis: attrs.axis,
			},
		]
	},
}
