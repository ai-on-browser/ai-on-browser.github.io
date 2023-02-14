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
		if (tensor.dataType === 1) {
			arr = Array.from(new Float32Array(rawdata.buffer, rawdata.byteOffset))
		} else if (tensor.dataType === 2) {
			arr = Array.from(rawdata)
		} else if (tensor.dataType === 3) {
			arr = Array.from(new Int8Array(rawdata.buffer, rawdata.byteOffset))
		} else if (tensor.dataType === 4) {
			arr = Array.from(new Uint16Array(rawdata.buffer, rawdata.byteOffset))
		} else if (tensor.dataType === 5) {
			arr = Array.from(new Int16Array(rawdata.buffer, rawdata.byteOffset))
		} else if (tensor.dataType === 6) {
			arr = Array.from(new Int32Array(rawdata.buffer, rawdata.byteOffset))
		} else if (tensor.dataType === 7) {
			arr = Array.from(new BigInt64Array(rawdata.buffer, rawdata.byteOffset), v => Number(v))
		} else if (tensor.dataType === 9) {
			arr = Array.from(rawdata, v => !!v)
		} else if (tensor.dataType === 10) {
			for (let i = 0; i < rawdata.length; i += 2) {
				const sign = rawdata[i + 1] & 0x80 ? -1 : 1
				const exponent = (rawdata[i + 1] & 0x7c) >>> 2
				const exp = exponent === 0 ? -14 : exponent - 15
				const fraction = (rawdata[i + 1] & 0x03) * 2 ** -2 + rawdata[i] * 2 ** -10
				if (exponent === 0x1f) {
					arr.push(fraction === 0 ? Infinity * sign : NaN)
				} else {
					arr.push(sign * (fraction + (exponent === 0 ? 0 : 1)) * 2 ** exp)
				}
			}
		} else if (tensor.dataType === 11) {
			arr = Array.from(new Float64Array(rawdata.buffer, rawdata.byteOffset))
		} else if (tensor.dataType === 12) {
			arr = Array.from(new Uint32Array(rawdata.buffer, rawdata.byteOffset))
		} else if (tensor.dataType === 13) {
			arr = Array.from(new BigUint64Array(rawdata.buffer, rawdata.byteOffset), v => Number(v))
		} else {
			throw new Error(`Not implemented data type ${tensor.dataType}`)
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
