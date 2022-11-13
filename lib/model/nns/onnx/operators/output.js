import { onnx } from '../onnx_importer.js'

/**
 * Handle output node
 *
 * @module HandleONNXOutputNode
 */
export default {
	/**
	 * Import from onnx object.
	 *
	 * @param {onnx.ModelProto.AsObject} model Model object
	 * @param {onnx.ValueInfoProto.AsObject} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		return [{ type: 'output', input: node.name }]
	},
}
