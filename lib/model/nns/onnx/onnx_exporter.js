import onnx from './onnx_pb.js'
export { default as onnx } from './onnx_pb.js'

import * as layers from './layer/index.js'

/**
 * ONNX exporter
 */
export default class ONNXExporter {
	/**
	 * Create onnx model proto.
	 * @returns {onnx.ModelProto} Model proto
	 */
	static createONNXModel() {
		const model = new onnx.ModelProto()
		model.setProducerName('ai-on-browser/data-analysis-models')
		model.setProducerVersion('0.24.0')
		model.setIrVersion(9)

		const opsetImport = new onnx.OperatorSetIdProto()
		opsetImport.setDomain('')
		opsetImport.setVersion(19)
		model.addOpsetImport(opsetImport)

		const graph = new onnx.GraphProto()
		graph.setName('graph')
		model.setGraph(graph)
		return model
	}

	/**
	 * Dump layer object.
	 * @param {import("../graph").LayerObject["type"]} type The layer type
	 * @returns {*} Layer exporter
	 */
	static getLayerExporter(type) {
		type = type.toLowerCase()
		if (!layers[type]) {
			console.error(`Unimplemented layer ${type}.`)
			return null
		}
		return layers[type]
	}

	/**
	 * Dump onnx model.
	 * @param {import("../graph").LayerObject[]} nodes represented the graph
	 * @returns {Uint8Array} Protocol buffer data
	 */
	static dump(nodes) {
		const model = ONNXExporter.createONNXModel()

		const ns = []
		const existNames = new Set()
		for (const node of nodes) {
			ns.push({ ...node })
			if (node.name) {
				existNames.add(node.name)
			}
		}
		const constNumbers = new Set()
		for (let i = 0; i < ns.length; i++) {
			if (!ns[i].name) {
				const basename = `_${ns[i].type}`
				let name = basename
				let c = 1
				while (existNames.has(name)) {
					name = basename + '_' + c
					c++
				}
				ns[i].name = name
				existNames.add(name)
			}
			if (i > 0 && !ns[i].input) {
				ns[i].input = ns[i - 1].name
			}
			if (Array.isArray(ns[i].input)) {
				for (let k = 0; k < ns[i].input.length; k++) {
					if (typeof ns[i].input[k] === 'number') {
						constNumbers.add(ns[i].input[k])
						ns[i].input[k] = `__const_number_${ns[i].input[k]}`
					}
				}
			} else if (typeof ns[i].input === 'number') {
				constNumbers.add(ns[i].input)
				ns[i].input = `__const_number_${ns[i].input}`
			}
		}
		for (const cn of constNumbers) {
			ns.unshift({ type: 'const', value: cn, name: `__const_number_${cn}` })
		}

		const outputInfo = {}
		for (const node of ns) {
			const exporter = ONNXExporter.getLayerExporter(node.type)
			if (exporter == null) {
				continue
			}
			const info = exporter.export(model, node, outputInfo)
			const inputs = Array.isArray(node.input) ? node.input : [node.input]
			outputInfo[node.name] = {
				type: onnx.TensorProto.DataType.Float,
				...outputInfo[inputs[0]],
				...info,
			}
			if (!info?.size && inputs.length > 1) {
				let size = outputInfo[node.name].size
				for (let i = 1; i < inputs.length; i++) {
					const si = outputInfo[inputs[i]].size
					if (!si) {
						continue
					}
					const length = Math.max(si.length, size.length)
					size = Array.from({ length }, (_, i) => {
						const sa = size[size.length - length + i]
						const sb = si[si.length - length + i]
						if (sa == null || sb == null) {
							return null
						}
						return Math.max(sa, sb)
					})
				}
				outputInfo[node.name].size = size
			}
		}

		return model.serializeBinary()
	}
}
