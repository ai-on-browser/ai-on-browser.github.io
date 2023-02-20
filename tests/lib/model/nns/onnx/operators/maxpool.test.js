import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Tensor from '../../../../../../lib/util/tensor.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('maxpool', async () => {
		const buf = await fs.promises.readFile(`${filepath}/maxpool.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({
			type: 'max_pool',
			input: ['x'],
			name: 'y',
			channel_dim: 1,
			kernel: [2, 2],
			padding: 0,
			stride: 2,
		})
	})

	test('maxpool_auto_pad_same_upper', async () => {
		const buf = await fs.promises.readFile(`${filepath}/maxpool_auto_pad_same_upper.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({
			type: 'max_pool',
			input: ['x'],
			name: 'y',
			channel_dim: 1,
			kernel: [2, 2],
			padding: [1, 1],
			stride: 1,
		})
	})

	test('maxpool_auto_pad_notset', async () => {
		const buf = await fs.promises.readFile(`${filepath}/maxpool_auto_pad_notset.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({
			type: 'max_pool',
			input: ['x'],
			name: 'y',
			channel_dim: 1,
			kernel: [2, 2],
			padding: [
				[1, 0],
				[1, 0],
			],
			stride: 1,
		})
	})

	test('maxpool_different_strides', async () => {
		const buf = await fs.promises.readFile(`${filepath}/maxpool_different_strides.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'strides' value 2,1."))
	})

	test('maxpool_auto_pad_same_lower', async () => {
		const buf = await fs.promises.readFile(`${filepath}/maxpool_auto_pad_same_lower.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(
			new Error("Invalid attribute 'auto_pad' value SAME_LOWER.")
		)
	})

	test('maxpool_auto_pad_valid', async () => {
		const buf = await fs.promises.readFile(`${filepath}/maxpool_auto_pad_valid.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'auto_pad' value VALID."))
	})
})

describe('nn', () => {
	test('maxpool', async () => {
		const buf = await fs.promises.readFile(`${filepath}/maxpool.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('MaxPoolLayer')
		const x = Tensor.randn([20, 2, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 5, 5])
	})

	test('maxpool_auto_pad_same_upper', async () => {
		const buf = await fs.promises.readFile(`${filepath}/maxpool_auto_pad_same_upper.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('MaxPoolLayer')
		const x = Tensor.randn([20, 2, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 11, 11])
	})

	test('maxpool_auto_pad_notset', async () => {
		const buf = await fs.promises.readFile(`${filepath}/maxpool_auto_pad_notset.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('MaxPoolLayer')
		const x = Tensor.randn([20, 2, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 10, 10])
	})
})
