import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Tensor from '../../../../../../lib/util/tensor.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('batchnormalization', async () => {
		const buf = await fs.promises.readFile(`${filepath}/batchnormalization.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('batch_normalization')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].scale).toHaveLength(3)
		expect(nodes[1].offset).toHaveLength(3)
		expect(nodes[1].epsilon).toBe(1.0e-5)
		expect(nodes[1].input_mean).toHaveLength(3)
		expect(nodes[1].input_var).toHaveLength(3)
	})

	test('batchnormalization_training_mode', async () => {
		const buf = await fs.promises.readFile(`${filepath}/batchnormalization_training_mode.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'training_mode' value 1."))
	})

	test('batchnormalization_dummy_init', async () => {
		const buf = await fs.promises.readFile(`${filepath}/batchnormalization_dummy_init.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('batch_normalization')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].scale).toHaveLength(3)
		expect(nodes[1].offset).toHaveLength(3)
		expect(nodes[1].epsilon).toBe(1.0e-5)
		expect(nodes[1].input_mean).toHaveLength(3)
		expect(nodes[1].input_var).toHaveLength(3)
	})

	test('batchnormalization_other_node', async () => {
		const buf = await fs.promises.readFile(`${filepath}/batchnormalization_other_node.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(7)
		expect(nodes[1].type).toBe('const')
		expect(nodes[1].name).toBe('scale')
		expect(nodes[1].value).toHaveLength(3)
		expect(nodes[2].type).toBe('const')
		expect(nodes[2].name).toBe('b')
		expect(nodes[2].value).toHaveLength(3)
		expect(nodes[3].type).toBe('const')
		expect(nodes[3].name).toBe('in_mean')
		expect(nodes[3].value).toHaveLength(3)
		expect(nodes[4].type).toBe('const')
		expect(nodes[4].name).toBe('in_var')
		expect(nodes[4].value).toHaveLength(3)
		expect(nodes[5].type).toBe('batch_normalization')
		expect(nodes[5].input).toEqual(['x'])
		expect(nodes[5].scale).toBe('scale')
		expect(nodes[5].offset).toBe('b')
		expect(nodes[5].epsilon).toBe(1.0e-5)
		expect(nodes[5].input_mean).toBe('in_mean')
		expect(nodes[5].input_var).toBe('in_var')
	})

	test('batchnormalization_multioutput', async () => {
		const buf = await fs.promises.readFile(`${filepath}/batchnormalization_multioutput.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(7)
		expect(nodes[1].type).toBe('batch_normalization')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].scale).toHaveLength(3)
		expect(nodes[1].offset).toHaveLength(3)
		expect(nodes[1].epsilon).toBe(1.0e-5)
		expect(nodes[1].input_mean).toHaveLength(3)
		expect(nodes[1].input_var).toHaveLength(3)
		expect(nodes[2]).toEqual({ type: 'identity', input: ['y[mean]'], name: 'mean' })
		expect(nodes[3]).toEqual({ type: 'identity', input: ['y[var]'], name: 'var' })
	})
})

describe('nn', () => {
	test('batchnormalization', async () => {
		const buf = await fs.promises.readFile(`${filepath}/batchnormalization.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('BatchNormalizationLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 3, 10, 10])
	})

	test('batchnormalization_dummy_init', async () => {
		const buf = await fs.promises.readFile(`${filepath}/batchnormalization_dummy_init.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('BatchNormalizationLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 3, 10, 10])
	})

	test('batchnormalization_other_node', async () => {
		const buf = await fs.promises.readFile(`${filepath}/batchnormalization_other_node.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('BatchNormalizationLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 3, 10, 10])
	})

	test('batchnormalization_multioutput', async () => {
		const buf = await fs.promises.readFile(`${filepath}/batchnormalization_multioutput.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('BatchNormalizationLayer')
		const x = Tensor.randn([20, 3, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 3, 10, 10])
	})
})
