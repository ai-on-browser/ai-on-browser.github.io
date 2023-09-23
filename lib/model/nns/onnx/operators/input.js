import { onnx } from '../onnx_importer.js'

/**
 * Handle input node
 *
 * @module HandleONNXInputNode
 */
export default {
	/**
	 * Import from onnx object.
	 *
	 * @param {onnx.ModelProto} model Model object
	 * @param {onnx.ValueInfoProto} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		return [{ type: 'input', name: node.getName() }]
	},
}
