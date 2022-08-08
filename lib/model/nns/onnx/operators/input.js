import { onnx } from '../onnx_importer.js'

export default {
	/**
	 * Import fron onnx object.
	 *
	 * @param {onnx.ModelProto.AsObject} model Model object
	 * @param {onnx.ValueInfoProto.AsObject} node Node object
	 * @returns {object[]} Objects represented a layer
	 */
	import(model, node) {
		return [{ type: 'input', name: node.name }]
	},
}
