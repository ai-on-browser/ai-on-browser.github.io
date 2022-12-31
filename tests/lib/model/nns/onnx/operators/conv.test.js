import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Tensor from '../../../../../../lib/util/tensor.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('conv', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 10, 10])
	})

	test('conv_kernel_shape', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_kernel_shape.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 6, 6])
	})

	test('conv_bias', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_bias.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 10, 10])
	})

	test('conv_same_strides', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_same_strides.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 4, 4])
	})

	test('conv_auto_pad_same_upper', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_auto_pad_same_upper.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 10, 10])
	})

	test('conv_auto_pad_notset', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_auto_pad_notset.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 10, 10])
	})

	test('conv_group_2', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_group_2.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'group' value 2."))
	})

	test('conv_different_pads', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_different_pads.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'pads' value 2,2,1,1."))
	})

	test('conv_different_strides', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_different_strides.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'strides' value 2,1."))
	})

	test('conv_auto_pad_same_lower', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_auto_pad_same_lower.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'auto_pad' value SAME_LOWER."))
	})

	test('conv_auto_pad_valid', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_auto_pad_valid.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'auto_pad' value VALID."))
	})
})
