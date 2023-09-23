import { onnx } from '../onnx_importer.js'
import { loadTensor } from '../utils.js'

/**
 * Handle clip operator
 *
 * @module HandleONNXClipOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#clip
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
				initializers.min = loadTensor(initializer)
			}
			if (initializer.getName() === inputList[2]) {
				initializers.max = loadTensor(initializer)
			}
		}
		return [
			{
				type: 'clip',
				input: [inputList[0]],
				name: node.getOutputList()[0],
				min: initializers.min ?? (inputList[1]?.length > 0 ? inputList[1] : undefined),
				max: initializers.max ?? (inputList[2]?.length > 0 ? inputList[2] : undefined),
			},
		]
	},
}
