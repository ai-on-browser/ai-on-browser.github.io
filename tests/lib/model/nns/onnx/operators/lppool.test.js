import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Tensor from '../../../../../../lib/util/tensor.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('lppool', async () => {
		const buf = await fs.promises.readFile(`${filepath}/lppool.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LpPoolLayer')
		const x = Tensor.randn([20, 2, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 5, 5])
	})

	test('lppool_auto_pad_same_upper', async () => {
		const buf = await fs.promises.readFile(`${filepath}/lppool_auto_pad_same_upper.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LpPoolLayer')
		const x = Tensor.randn([20, 2, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 11, 11])
	})

	test('lppool_auto_pad_notset', async () => {
		const buf = await fs.promises.readFile(`${filepath}/lppool_auto_pad_notset.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LpPoolLayer')
		const x = Tensor.randn([20, 2, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 10, 10])
	})

	test('lppool_different_strides', async () => {
		const buf = await fs.promises.readFile(`${filepath}/lppool_different_strides.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'strides' value 2,1."))
	})

	test('lppool_auto_pad_same_lower', async () => {
		const buf = await fs.promises.readFile(`${filepath}/lppool_auto_pad_same_lower.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(
			new Error("Invalid attribute 'auto_pad' value SAME_LOWER.")
		)
	})

	test('lppool_auto_pad_valid', async () => {
		const buf = await fs.promises.readFile(`${filepath}/lppool_auto_pad_valid.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'auto_pad' value VALID."))
	})
})
