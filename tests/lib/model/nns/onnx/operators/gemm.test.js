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

	test('gemm_0D_bias', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_0D_bias.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('full')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].name).toBe('y')
		expect(Matrix.fromArray(nodes[1].b).sizes).toEqual([1, 1])
		expect(Matrix.fromArray(nodes[1].w).sizes).toEqual([10, 3])
	})

	test('gemm_other_node', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_other_node.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(5)
		expect(nodes[3].type).toBe('full')
		expect(nodes[3].input).toEqual(['x'])
		expect(nodes[3].name).toBe('y')
		expect(nodes[3].b).toBe('b')
		expect(nodes[3].w).toEqual('w')
	})

	test('gemm_other_node_attrs', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_other_node_attrs.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(8)
		expect(nodes[6].type).toBe('full')
		expect(nodes[6].input).toEqual(['x'])
		expect(nodes[6].name).toBe('y')
		expect(nodes[6].b).toBe('b_mul_b')
		expect(nodes[6].w).toEqual('w_mul_a')
	})

	test('gemm_other_node_transA_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_other_node_transA_1.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(6)
		expect(nodes[4].type).toBe('full')
		expect(nodes[4].input).toEqual(['x_t'])
		expect(nodes[4].name).toBe('y')
		expect(nodes[4].b).toBe('b')
		expect(nodes[4].w).toEqual('w')
	})

	test('gemm_other_node_transB_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_other_node_transB_1.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(6)
		expect(nodes[4].type).toBe('full')
		expect(nodes[4].input).toEqual(['x'])
		expect(nodes[4].name).toBe('y')
		expect(nodes[4].b).toBe('b')
		expect(nodes[4].w).toEqual('w_t')
	})

	test('gemm_other_node_1D_bias', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_other_node_1D_bias.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(5)
		expect(nodes[3].type).toBe('full')
		expect(nodes[3].input).toEqual(['x'])
		expect(nodes[3].name).toBe('y')
		expect(nodes[3].b).toBe('b')
		expect(nodes[3].w).toEqual('w')
	})

	test('gemm_other_node_0D_bias', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_other_node_0D_bias.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(5)
		expect(nodes[3].type).toBe('full')
		expect(nodes[3].input).toEqual(['x'])
		expect(nodes[3].name).toBe('y')
		expect(nodes[3].b).toBe('b')
		expect(nodes[3].w).toEqual('w')
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

	test('gemm_other_node', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_other_node.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('FullyConnected')
		const x = Matrix.randn(20, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 3])
	})

	test('gemm_other_node_attrs', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_other_node_attrs.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('FullyConnected')
		const x = Matrix.randn(20, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 3])
	})

	test('gemm_other_node_transA_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_other_node_transA_1.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('FullyConnected')
		const x = Matrix.randn(10, 20)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 3])
	})

	test('gemm_other_node_transB_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_other_node_transB_1.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('FullyConnected')
		const x = Matrix.randn(20, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 3])
	})

	test('gemm_other_node_1D_bias', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm_other_node_1D_bias.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('FullyConnected')
		const x = Matrix.randn(20, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 3])
	})
})
