import { onnx } from '../onnx_importer.js'

/**
 * Handle mean operator
 *
 * @module HandleONNXMeanOperator
 * @see https://github.com/onnx/onnx/blob/main/docs/Operators.md#Mean
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
		return [
			{ type: 'add', input: node.inputList, name: node.outputList[0] + '_sum' },
			{ type: 'const', input: [], name: node.outputList[0] + '_den', value: node.inputList.length },
			{
				type: 'div',
				input: [node.outputList[0] + '_sum', node.outputList[0] + '_den'],
				name: node.outputList[0],
			},
		]
	},
}
