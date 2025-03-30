import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Tensor from '../../../../../../lib/util/tensor.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('conv', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('conv')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].name).toBe('y')
		expect(nodes[1].channel).toBe(2)
		expect(nodes[1].channel_dim).toBe(1)
		expect(nodes[1].kernel).toEqual([5, 5])
		expect(nodes[1].padding).toEqual([
			[2, 2],
			[2, 2],
		])
		expect(nodes[1].stride).toBeNull()
		expect(Tensor.fromArray(nodes[1].w).sizes).toEqual([2, 3, 5, 5])
	})

	test('conv_kernel_shape', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_kernel_shape.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('conv')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].name).toBe('y')
		expect(nodes[1].channel).toBe(2)
		expect(nodes[1].channel_dim).toBe(1)
		expect(nodes[1].kernel).toEqual([5, 5])
		expect(nodes[1].padding).toBe(0)
		expect(nodes[1].stride).toBeNull()
		expect(Tensor.fromArray(nodes[1].w).sizes).toEqual([2, 3, 5, 5])
	})

	test('conv_bias', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_bias.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('conv')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].name).toBe('y')
		expect(nodes[1].channel).toBe(2)
		expect(nodes[1].channel_dim).toBe(1)
		expect(nodes[1].kernel).toEqual([5, 5])
		expect(nodes[1].padding).toEqual([
			[2, 2],
			[2, 2],
		])
		expect(nodes[1].stride).toBeNull()
		expect(Tensor.fromArray(nodes[1].w).sizes).toEqual([2, 3, 5, 5])
	})

	test('conv_same_strides', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_same_strides.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('conv')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].name).toBe('y')
		expect(nodes[1].channel).toBe(2)
		expect(nodes[1].channel_dim).toBe(1)
		expect(nodes[1].kernel).toEqual([5, 5])
		expect(nodes[1].padding).toBe(0)
		expect(nodes[1].stride).toBe(2)
		expect(Tensor.fromArray(nodes[1].w).sizes).toEqual([2, 3, 5, 5])
	})

	test('conv_auto_pad_same_upper', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_auto_pad_same_upper.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('conv')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].name).toBe('y')
		expect(nodes[1].channel).toBe(2)
		expect(nodes[1].channel_dim).toBe(1)
		expect(nodes[1].kernel).toEqual([5, 5])
		expect(nodes[1].padding).toEqual([
			[2, 2],
			[2, 2],
		])
		expect(nodes[1].stride).toBeNull()
		expect(Tensor.fromArray(nodes[1].w).sizes).toEqual([2, 3, 5, 5])
	})

	test('conv_auto_pad_notset', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_auto_pad_notset.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('conv')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].name).toBe('y')
		expect(nodes[1].channel).toBe(2)
		expect(nodes[1].channel_dim).toBe(1)
		expect(nodes[1].kernel).toEqual([5, 5])
		expect(nodes[1].padding).toEqual([
			[2, 2],
			[2, 2],
		])
		expect(nodes[1].stride).toBeNull()
		expect(Tensor.fromArray(nodes[1].w).sizes).toEqual([2, 3, 5, 5])
	})

	test('conv_group_2', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_group_2.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'group' value 2."))
	})

	test('conv_different_pads', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_different_pads.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('conv')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].name).toBe('y')
		expect(nodes[1].channel).toBe(2)
		expect(nodes[1].channel_dim).toBe(1)
		expect(nodes[1].kernel).toEqual([5, 5])
		expect(nodes[1].padding).toEqual([
			[2, 1],
			[2, 1],
		])
		expect(nodes[1].stride).toBeNull()
		expect(Tensor.fromArray(nodes[1].w).sizes).toEqual([2, 3, 5, 5])
	})

	test('conv_different_strides', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_different_strides.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'strides' value 2,1."))
	})

	test('conv_auto_pad_same_lower', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_auto_pad_same_lower.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('conv')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].name).toBe('y')
		expect(nodes[1].channel).toBe(2)
		expect(nodes[1].channel_dim).toBe(1)
		expect(nodes[1].kernel).toEqual([5, 5])
		expect(nodes[1].padding).toEqual([
			[2, 2],
			[2, 2],
		])
		expect(nodes[1].stride).toBeNull()
		expect(Tensor.fromArray(nodes[1].w).sizes).toEqual([2, 3, 5, 5])
	})

	test('conv_auto_pad_valid', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_auto_pad_valid.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'auto_pad' value VALID."))
	})

	test('conv_dummy_init', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_dummy_init.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('conv')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].name).toBe('y')
		expect(nodes[1].channel).toBe(2)
		expect(nodes[1].channel_dim).toBe(1)
		expect(nodes[1].kernel).toEqual([5, 5])
		expect(nodes[1].padding).toEqual([
			[2, 2],
			[2, 2],
		])
		expect(nodes[1].stride).toBeNull()
		expect(Tensor.fromArray(nodes[1].w).sizes).toEqual([2, 3, 5, 5])
	})

	test('conv_other_node', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_other_node.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(4)
		expect(nodes[1].type).toBe('const')
		expect(nodes[1].name).toBe('w')
		expect(Tensor.fromArray(nodes[1].value).sizes).toEqual([2, 3, 5, 5])
		expect(nodes[2].type).toBe('conv')
		expect(nodes[2].input).toEqual(['x'])
		expect(nodes[2].name).toBe('y')
		expect(nodes[2].channel).toBeNull()
		expect(nodes[2].channel_dim).toBe(1)
		expect(nodes[2].kernel).toBeUndefined()
		expect(nodes[2].padding).toEqual([
			[2, 2],
			[2, 2],
		])
		expect(nodes[2].stride).toBeNull()
		expect(nodes[2].w).toBe('w')
	})
})

describe('nn', () => {
	test('conv', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 10, 10])
	})

	test('conv_kernel_shape', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_kernel_shape.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 6, 6])
	})

	test('conv_bias', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_bias.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 10, 10])
	})

	test('conv_same_strides', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_same_strides.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 4, 4])
	})

	test('conv_auto_pad_same_upper', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_auto_pad_same_upper.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 10, 10])
	})

	test('conv_auto_pad_notset', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_auto_pad_notset.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 10, 10])
	})

	test('conv_different_pads', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_different_pads.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 9, 9])
	})

	test('conv_auto_pad_same_lower', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_auto_pad_same_lower.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 10, 10])
	})

	test('conv_dummy_init', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_dummy_init.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 10, 10])
	})

	test.skip('conv_other_node', async () => {
		const buf = await fs.promises.readFile(`${filepath}/conv_other_node.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConvLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 10, 10])
	})
})
