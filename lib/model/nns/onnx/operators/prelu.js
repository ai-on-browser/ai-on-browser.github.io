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
	 * @param {onnx.ModelProto.AsObject} model Model object
	 * @param {onnx.NodeProto.AsObject} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		const initializers = {}
		for (const initializer of model.graph.initializerList) {
			if (initializer.name === node.inputList[1]) {
				initializers.slope = loadTensor(initializer)
			}
		}
		if (Array.isArray(initializers.slope)) {
			throw new Error(`Invalid slope value ${initializers.slope}.`)
		}
		return [{ type: 'prelu', input: [node.inputList[0]], name: node.outputList[0], a: initializers.slope }]
	},
}
