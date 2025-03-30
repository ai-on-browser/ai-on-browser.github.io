import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Tensor from '../../../../../../lib/util/tensor.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('layernormalization', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('layer_normalization')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].axis).toBe(-1)
		expect(nodes[1].scale).toHaveLength(3)
		expect(nodes[1].offset).toHaveLength(3)
		expect(nodes[1].epsilon).toBe(1.0e-5)
	})

	test('layernormalization_axis_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization_axis_1.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('layer_normalization')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].axis).toBe(1)
		expect(nodes[1].scale).toHaveLength(10)
		expect(nodes[1].offset).toHaveLength(10)
		expect(nodes[1].epsilon).toBe(1.0e-5)
	})

	test('layernormalization_epsilon_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization_epsilon_1.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('layer_normalization')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].axis).toBe(-1)
		expect(nodes[1].scale).toHaveLength(3)
		expect(nodes[1].offset).toHaveLength(3)
		expect(nodes[1].epsilon).toBeCloseTo(1.0e-8)
	})

	test('layernormalization_other_node', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization_other_node.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(5)
		expect(nodes[3].type).toBe('layer_normalization')
		expect(nodes[3].input).toEqual(['x'])
		expect(nodes[3].axis).toBe(-1)
		expect(nodes[3].scale).toBe('scale')
		expect(nodes[3].offset).toBe('b')
		expect(nodes[3].epsilon).toBe(1.0e-5)
	})

	test('layernormalization_other_node_axis_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization_other_node_axis_1.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(5)
		expect(nodes[3].type).toBe('layer_normalization')
		expect(nodes[3].input).toEqual(['x'])
		expect(nodes[3].axis).toBe(1)
		expect(nodes[3].scale).toBe('scale')
		expect(nodes[3].offset).toBe('b')
		expect(nodes[3].epsilon).toBe(1.0e-5)
	})

	test('layernormalization_other_node_epsilon_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization_other_node_epsilon_1.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(5)
		expect(nodes[3].type).toBe('layer_normalization')
		expect(nodes[3].input).toEqual(['x'])
		expect(nodes[3].axis).toBe(-1)
		expect(nodes[3].scale).toBe('scale')
		expect(nodes[3].offset).toBe('b')
		expect(nodes[3].epsilon).toBeCloseTo(1.0e-8)
	})

	test('layernormalization_dummy_init', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization_dummy_init.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('layer_normalization')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].axis).toBe(-1)
		expect(nodes[1].scale).toHaveLength(3)
		expect(nodes[1].offset).toHaveLength(3)
		expect(nodes[1].epsilon).toBe(1.0e-5)
	})

	test('layernormalization_multioutput', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization_multioutput.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(7)
		expect(nodes[1].type).toBe('layer_normalization')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].axis).toBe(-1)
		expect(nodes[1].scale).toHaveLength(3)
		expect(nodes[1].offset).toHaveLength(3)
		expect(nodes[1].epsilon).toBe(1.0e-5)
		expect(nodes[2]).toEqual({ type: 'identity', input: ['y[mean]'], name: 'mean' })
		expect(nodes[3]).toEqual({ type: 'identity', input: ['y[invStdDev]'], name: 'invstddev' })
	})
})

describe('nn', () => {
	test('layernormalization', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LayerNormalizationLayer')
		const x = Tensor.randn([20, 10, 10, 3])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 10, 10, 3])
	})

	test('layernormalization_axis_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization_axis_1.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LayerNormalizationLayer')
		const x = Tensor.randn([20, 10, 10, 3])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 10, 10, 3])
	})

	test('layernormalization_epsilon_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization_epsilon_1.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LayerNormalizationLayer')
		const x = Tensor.randn([20, 10, 10, 3])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 10, 10, 3])
	})

	test('layernormalization_other_node', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization_other_node.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LayerNormalizationLayer')
		const x = Tensor.randn([20, 10, 10, 3])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 10, 10, 3])
	})

	test('layernormalization_other_node_axis_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization_other_node_axis_1.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LayerNormalizationLayer')
		const x = Tensor.randn([20, 10, 10, 3])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 10, 10, 3])
	})

	test('layernormalization_other_node_epsilon_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization_other_node_epsilon_1.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LayerNormalizationLayer')
		const x = Tensor.randn([20, 10, 10, 3])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 10, 10, 3])
	})

	test('layernormalization_dummy_init', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization_dummy_init.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LayerNormalizationLayer')
		const x = Tensor.randn([20, 10, 10, 3])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 10, 10, 3])
	})

	test('layernormalization_multioutput', async () => {
		const buf = await fs.promises.readFile(`${filepath}/layernormalization_multioutput.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LayerNormalizationLayer')
		const x = Tensor.randn([20, 10, 10, 3])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 10, 10, 3])
	})
})
