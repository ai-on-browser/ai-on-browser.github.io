import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('gemm', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('full')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].name).toBe('y')
		expect(Matrix.fromArray(nodes[1].b).sizes).toEqual([1, 3])
		expect(Matrix.fromArray(nodes[1].w).sizes).toEqual([10, 3])
	})

	test('gemm_attrs', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_attrs.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('full')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].name).toBe('y')
		expect(Matrix.fromArray(nodes[1].b).sizes).toEqual([1, 3])
		expect(Matrix.fromArray(nodes[1].w).sizes).toEqual([10, 3])
	})

	test('gemm_transA_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_transA_1.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(4)
		expect(nodes[2].type).toBe('full')
		expect(nodes[2].input).toEqual(['x_t'])
		expect(nodes[2].name).toBe('y')
		expect(Matrix.fromArray(nodes[2].b).sizes).toEqual([1, 3])
		expect(Matrix.fromArray(nodes[2].w).sizes).toEqual([10, 3])
	})

	test('gemm_transB_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_transB_1.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('full')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].name).toBe('y')
		expect(Matrix.fromArray(nodes[1].b).sizes).toEqual([1, 3])
		expect(Matrix.fromArray(nodes[1].w).sizes).toEqual([10, 3])
	})

	test('gemm_1D_bias', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_1D_bias.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('full')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].name).toBe('y')
		expect(Matrix.fromArray(nodes[1].b).sizes).toEqual([1, 3])
		expect(Matrix.fromArray(nodes[1].w).sizes).toEqual([10, 3])
	})
})

describe('nn', () => {
	test('gemm', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('FullyConnected')
		const x = Matrix.randn(20, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 3])
	})

	test('gemm_attrs', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_attrs.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('FullyConnected')
		const x = Matrix.randn(20, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 3])
	})

	test('gemm_transA_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_transA_1.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('FullyConnected')
		const x = Matrix.randn(10, 20)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 3])
	})

	test('gemm_transB_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_transB_1.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('FullyConnected')
		const x = Matrix.randn(20, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 3])
	})

	test('gemm_1D_bias', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_1D_bias.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('FullyConnected')
		const x = Matrix.randn(20, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 3])
	})
})
