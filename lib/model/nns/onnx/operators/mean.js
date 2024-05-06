import { onnx } from '../onnx_importer.js'

/**
 * Handle mean operator
 * @module HandleONNXMeanOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#Mean
 */
export default {
	/**
	 * Import from onnx object.
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.NodeProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		const outputName = node.getOutputList()[0]
		return [
			{ type: 'add', input: node.getInputList(), name: outputName + '_sum' },
			{ type: 'const', input: [], name: outputName + '_den', value: node.getInputList().length },
			{
				type: 'div',
				input: [outputName + '_sum', outputName + '_den'],
				name: outputName,
			},
		]
	},
}
