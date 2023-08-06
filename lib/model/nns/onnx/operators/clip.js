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
	 * @param {onnx.ModelProto.AsObject} model Model object
	 * @param {onnx.NodeProto.AsObject} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		const initializers = {}
		for (const initializer of model.graph.initializerList) {
			if (initializer.name === node.inputList[1]) {
				initializers.min = loadTensor(initializer)
			}
			if (initializer.name === node.inputList[2]) {
				initializers.max = loadTensor(initializer)
			}
		}
		return [
			{
				type: 'clip',
				input: [node.inputList[0]],
				name: node.outputList[0],
				min: initializers.min ?? (node.inputList[1]?.length > 0 ? node.inputList[1] : undefined),
				max: initializers.max ?? (node.inputList[2]?.length > 0 ? node.inputList[2] : undefined),
			},
		]
	},
}
