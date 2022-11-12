import { onnx } from './onnx_importer.js'

/**
 * Return Tensor value.
 *
 * @param {onnx.TensorProto.AsObject} tensor TensorProto
 * @returns {number | number[] | number[][] | number[][][] | number[][][][]} Tensor value
 * @see https://github.com/onnx/onnx/blob/main/onnx/onnx.proto#L479
 */
export const loadTensor = tensor => {
	const dims = tensor.dimsList
	const length = dims.reduce((s, v) => s * v, 1)

	let arr = []
	if (tensor.floatDataList.length > 0) {
		arr = tensor.floatDataList
	} else if (tensor.int32DataList.length > 0) {
		arr = tensor.int32DataList
	} else if (tensor.int64DataList.length > 0) {
		arr = tensor.int64DataList
	} else if (tensor.uint64DataList.length > 0) {
		arr = tensor.uint64DataList
	} else if (tensor.doubleDataList.length > 0) {
		arr = tensor.doubleDataList
	} else if (tensor.stringDataList.length > 0) {
		arr = tensor.stringDataList
	} else {
		let rawdata = tensor.rawData
		if (typeof rawdata === 'string') {
			const buff = Buffer.from(rawdata, 'base64')
			rawdata = new Uint8Array(buff.buffer, buff.byteOffset, buff.byteLength / Uint8Array.BYTES_PER_ELEMENT)
		}
		const step = rawdata.length / length
		for (let i = 0; i < rawdata.length; i += step) {
			const sign = rawdata[i + 3] & 0x80 ? -1 : 1
			const exponent = (rawdata[i + 3] & 0x7f) * 2 + ((rawdata[i + 2] & 0x80) >>> 7)
			const exp = exponent === 0 ? 0 : exponent - 127
			const fraction = (rawdata[i + 2] & 0x7f) * 2 ** -7 + rawdata[i + 1] * 2 ** -15 + rawdata[i + 0] * 2 ** -23
			arr.push(sign * (fraction + 1) * 2 ** exp)
		}
	}

	if (dims.length === 0) {
		return arr[0]
	}
	const ten = []
	let leaf = [ten]
	let c = 0
	for (let i = 0; i < dims.length; i++) {
		const next_leaf = []
		for (const l of leaf) {
			if (i === dims.length - 1) {
				l.push(...arr.slice(c, c + dims[i]))
				c += dims[i]
			} else {
				for (let k = 0; k < dims[i]; k++) {
					next_leaf.push((l[k] = []))
				}
			}
		}
		leaf = next_leaf
	}
	return ten
}

/**
 * Return attribute value.
 *
 * @param {onnx.AttributeProto.AsObject} attribute AttributeProto
 * @returns {*} Attribute value
 * @see https://github.com/onnx/onnx/blob/main/onnx/onnx.proto#L108
 */
export const loadAttribute = attribute => {
	switch (attribute.type) {
		case 1:
			return attribute.f
		case 2:
			return attribute.i
		case 3:
			return Buffer.from(attribute.s, 'base64').toString('utf8')
		case 4:
			return loadTensor(attribute.t)
		case 6:
			return attribute.floatsList
		case 7:
			return attribute.intsList
		case 8:
			return attribute.stringsList.map(s => Buffer.from(s, 'base64').toString('utf8'))
		case 9:
			return attribute.tensorsList.map(t => loadTensor(t))
	}
	throw new Error('Not implemented attribute type.')
}

/**
 *
 * @param {onnx.ModelProto.AsObject} model Model object
 * @param {string[]} names Input name
 * @returns {object[]} Require layer objects
 */
export const requireTensor = (model, names) => {
	const layers = []
	for (const initializer of model.graph.initializerList) {
		if (names.indexOf(initializer.name) >= 0) {
			layers.push({ type: 'const', value: loadTensor(initializer), name: initializer.name })
		}
	}
	return layers
}
