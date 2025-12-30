import fs from 'fs'
import path from 'path'
import url from 'url'

import { onnx } from '../../../../../lib/model/nns/onnx/onnx_importer'
import { loadAttribute, loadTensor } from '../../../../../lib/model/nns/onnx/utils'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('loadTensor', () => {
	const getTensorProto = async name => {
		const buf = await fs.promises.readFile(`${filepath}/${name}.onnx`)
		const model = onnx.ModelProto.deserializeBinary(buf)
		const graph = model.getGraph()
		const node = graph.getNodeList()[0]

		const attrs = {}
		for (const attribute of node.getAttributeList()) {
			attrs[attribute.getName()] = attribute
		}

		return attrs.value.getT()
	}

	test.each([
		'utils_tensor_floatDataList',
		'utils_tensor_int32DataList',
		'utils_tensor_int64DataList',
		'utils_tensor_doubleDataList',
		'utils_tensor_floatDataList_raw',
		'utils_tensor_int8_raw',
		'utils_tensor_int16_raw',
		'utils_tensor_int32_raw',
		'utils_tensor_int64_raw',
		'utils_tensor_float16_raw',
		'utils_tensor_double_raw',
	])('%s', async name => {
		const tensorProto = await getTensorProto(name)
		const ten = loadTensor(tensorProto)
		expect(ten).toEqual([
			[-1, 0],
			[1, 2],
		])
	})

	test.each([
		'utils_tensor_uint64DataList',
		'utils_tensor_uint8_raw',
		'utils_tensor_uint16_raw',
		'utils_tensor_uint32_raw',
		'utils_tensor_uint64_raw',
	])('%s', async name => {
		const tensorProto = await getTensorProto(name)
		const ten = loadTensor(tensorProto)
		expect(ten).toEqual([
			[0, 1],
			[2, 3],
		])
	})

	test.each(['utils_tensor_bool_raw'])('%s', async name => {
		const tensorProto = await getTensorProto(name)
		const ten = loadTensor(tensorProto)
		expect(ten).toEqual([
			[false, true],
			[true, true],
		])
	})

	test.each(['utils_tensor_stringDataList'])('%s', async name => {
		const tensorProto = await getTensorProto(name)
		const ten = loadTensor(tensorProto)
		expect(ten).toEqual([
			['a', 'b'],
			['c', 'd'],
		])
	})

	test('utils_tensor_zerodim', async () => {
		const tensorProto = await getTensorProto('utils_tensor_zerodim')
		const ten = loadTensor(tensorProto)
		expect(ten).toBe(1)
	})

	test.each([
		'utils_tensor_complex64_raw',
		'utils_tensor_complex128_raw',
		'utils_tensor_bfloat16_raw',
	])('%s', async name => {
		const tensorProto = await getTensorProto(name)
		expect(() => loadTensor(tensorProto)).toThrow('Not implemented data type')
	})
})

describe('loadAttribute', () => {
	const getAttributeProto = async name => {
		const buf = await fs.promises.readFile(`${filepath}/${name}.onnx`)
		const model = onnx.ModelProto.deserializeBinary(buf)
		const graph = model.getGraph()
		const node = graph.getNodeList()[0]

		for (const attribute of node.getAttributeList()) {
			return attribute
		}
	}

	test('utils_attribute_float', async () => {
		const attributeProto = await getAttributeProto('utils_attribute_float')
		const ten = loadAttribute(attributeProto)
		expect(ten).toEqual(1.5)
	})

	test('utils_attribute_int', async () => {
		const attributeProto = await getAttributeProto('utils_attribute_int')
		const ten = loadAttribute(attributeProto)
		expect(ten).toEqual(1)
	})

	test('utils_attribute_string', async () => {
		const attributeProto = await getAttributeProto('utils_attribute_string')
		const ten = loadAttribute(attributeProto)
		expect(ten).toEqual('str')
	})

	test('utils_attribute_tensor', async () => {
		const attributeProto = await getAttributeProto('utils_attribute_tensor')
		const ten = loadAttribute(attributeProto)
		expect(ten).toEqual([1])
	})

	test('utils_attribute_floats', async () => {
		const attributeProto = await getAttributeProto('utils_attribute_floats')
		const ten = loadAttribute(attributeProto)
		expect(ten).toEqual([1.5, 2.25])
	})

	test('utils_attribute_ints', async () => {
		const attributeProto = await getAttributeProto('utils_attribute_ints')
		const ten = loadAttribute(attributeProto)
		expect(ten).toEqual([1, 2])
	})

	test('utils_attribute_strings', async () => {
		const attributeProto = await getAttributeProto('utils_attribute_strings')
		const ten = loadAttribute(attributeProto)
		expect(ten).toEqual(['str', 'ing'])
	})

	test.each(['utils_attribute_sparse_tensor'])('%s', async name => {
		const attributeProto = await getAttributeProto(name)
		expect(() => loadAttribute(attributeProto)).toThrow('Not implemented attribute type.')
	})
})
