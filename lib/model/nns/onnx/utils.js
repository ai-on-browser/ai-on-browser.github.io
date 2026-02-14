import { onnx } from './onnx_importer.js'

/**
 * Return Tensor value.
 * @param {onnx.TensorProto} tensor TensorProto
 * @returns {number | number[] | number[][] | number[][][] | number[][][][]} Tensor value
 * @see https://github.com/onnx/onnx/blob/main/onnx/onnx.proto#L479
 */
export const loadTensor = tensor => {
	const dims = tensor.getDimsList()

	let arr = []
	if (tensor.getFloatDataList().length > 0) {
		arr = tensor.getFloatDataList()
	} else if (tensor.getInt32DataList().length > 0) {
		arr = tensor.getInt32DataList()
	} else if (tensor.getInt64DataList().length > 0) {
		arr = tensor.getInt64DataList()
	} else if (tensor.getUint64DataList().length > 0) {
		arr = tensor.getUint64DataList()
	} else if (tensor.getDoubleDataList().length > 0) {
		arr = tensor.getDoubleDataList()
	} else if (tensor.getStringDataList_asB64().length > 0) {
		arr = tensor.getStringDataList_asB64().map(s => Buffer.from(s, 'base64').toString())
	} else {
		let rawdata = tensor.getRawData_asB64()
		if (typeof rawdata === 'string') {
			const buff = Buffer.from(rawdata, 'base64')
			rawdata = new Uint8Array(buff.buffer, buff.byteOffset, buff.byteLength / Uint8Array.BYTES_PER_ELEMENT)
		}
		if (tensor.getDataType() === 1) {
			arr = Array.from(new Float32Array(rawdata.buffer, rawdata.byteOffset))
		} else if (tensor.getDataType() === 2) {
			arr = Array.from(rawdata)
		} else if (tensor.getDataType() === 3) {
			arr = Array.from(new Int8Array(rawdata.buffer, rawdata.byteOffset))
		} else if (tensor.getDataType() === 4) {
			arr = Array.from(new Uint16Array(rawdata.buffer, rawdata.byteOffset))
		} else if (tensor.getDataType() === 5) {
			arr = Array.from(new Int16Array(rawdata.buffer, rawdata.byteOffset))
		} else if (tensor.getDataType() === 6) {
			arr = Array.from(new Int32Array(rawdata.buffer, rawdata.byteOffset))
		} else if (tensor.getDataType() === 7) {
			arr = Array.from(new BigInt64Array(rawdata.buffer, rawdata.byteOffset), v => Number(v))
		} else if (tensor.getDataType() === 9) {
			arr = Array.from(rawdata, v => !!v)
		} else if (tensor.getDataType() === 10) {
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
		} else if (tensor.getDataType() === 11) {
			arr = Array.from(new Float64Array(rawdata.buffer, rawdata.byteOffset))
		} else if (tensor.getDataType() === 12) {
			arr = Array.from(new Uint32Array(rawdata.buffer, rawdata.byteOffset))
		} else if (tensor.getDataType() === 13) {
			arr = Array.from(new BigUint64Array(rawdata.buffer, rawdata.byteOffset), v => Number(v))
		} else {
			throw new Error(`Not implemented data type ${tensor.getDataType()}`)
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
 * @param {onnx.AttributeProto} attribute AttributeProto
 * @returns {*} Attribute value
 * @see https://github.com/onnx/onnx/blob/main/onnx/onnx.proto#L108
 */
export const loadAttribute = attribute => {
	switch (attribute.getType()) {
		case 1:
			return attribute.getF()
		case 2:
			return attribute.getI()
		case 3:
			return Buffer.from(attribute.getS_asB64(), 'base64').toString('utf8')
		case 4:
			return loadTensor(attribute.getT())
		case 6:
			return attribute.getFloatsList()
		case 7:
			return attribute.getIntsList()
		case 8:
			return attribute.getStringsList_asB64().map(s => Buffer.from(s, 'base64').toString('utf8'))
		case 9:
			return attribute.getTensorsList().map(t => loadTensor(t))
	}
	throw new Error('Not implemented attribute type.')
}

/**
 * Create const node if needed and return const node name.
 * @param {onnx.ModelProto} model Model object
 * @param {number} value Const value
 * @returns {string} Name of the const node
 */
export const getConstNodeName = (model, value) => {
	const nodeName = `__const_${value}`
	for (const node of model.getGraph().getNodeList()) {
		const outputs = node.getOutputList()
		if (outputs.length > 0 && outputs[0] === nodeName) {
			return nodeName
		}
	}
	const node = new onnx.NodeProto()
	node.setOpType('Constant')

	const tensor = new onnx.TensorProto()
	tensor.setDataType(onnx.TensorProto.DataType.FLOAT)
	tensor.setDimsList([1])
	tensor.setFloatDataList([value])
	const attrValue = new onnx.AttributeProto()
	attrValue.setName('value')
	attrValue.setType(onnx.AttributeProto.AttributeType.TENSOR)
	attrValue.setT(tensor)
	node.addAttribute(attrValue)

	node.addOutput(nodeName)
	model.getGraph().addNode(node)
	return nodeName
}
