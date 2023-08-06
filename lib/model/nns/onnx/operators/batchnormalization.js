import { onnx } from '../onnx_importer.js'
import { loadTensor, loadAttribute } from '../utils.js'

/**
 * Handle batch-normalization operator
 *
 * @module HandleONNXBatchNormalizationOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#BatchNormalization
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
		const attrs = { epsilon: 1e-5, momentum: 0.9, training_mode: 0 }
		for (const attribute of node.attributeList) {
			attrs[attribute.name] = loadAttribute(attribute)
		}
		const initializers = {}
		for (const initializer of model.graph.initializerList) {
			if (initializer.name === node.inputList[1]) {
				initializers.scale = loadTensor(initializer)
			} else if (initializer.name === node.inputList[2]) {
				initializers.b = loadTensor(initializer)
			} else if (initializer.name === node.inputList[3]) {
				initializers.inputMean = loadTensor(initializer)
			} else if (initializer.name === node.inputList[4]) {
				initializers.inputVar = loadTensor(initializer)
			}
		}
		if (attrs.training_mode) {
			throw new Error(`Invalid attribute 'training_mode' value ${attrs.training_mode}.`)
			// return [
			// 	{ type: 'const', input: [], value: 1, name: `${node.inputList[0]}_1` },
			// 	{ type: 'const', input: [], value: attrs.momentum, name: `${node.inputList[0]}_momentum` },
			// 	{ type: 'const', input: [], value: attrs.epsilon, name: `${node.inputList[0]}_epsilon` },
			// 	{
			// 		type: 'mult',
			// 		input: [node.inputList[3], `${node.inputList[0]}_momentum`],
			// 		name: `${node.inputList[3]}_momentum`,
			// 	},
			// ]
		}
		return [
			{
				type: 'batch_normalization',
				input: [node.inputList[0]],
				name: node.outputList[0],
				scale: initializers.scale ?? node.inputList[1],
				offset: initializers.b ?? node.inputList[2],
				epsilon: attrs.epsilon ?? 1.0e-5,
				input_mean: initializers.b ?? node.inputList[3],
				input_var: initializers.b ?? node.inputList[4],
				channel_dim: 1,
			},
		]
	},
}
