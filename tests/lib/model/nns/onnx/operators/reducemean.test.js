import fs from 'fs'
import path from 'path'
import url from 'url'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('reducemean', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemean.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'mean', input: ['x'], name: 'y', axis: [1], keepdims: true })
	})

	test('reducemean_not_keepdims', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemean_not_keepdims.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'mean', input: ['x'], name: 'y', axis: [1], keepdims: false })
	})

	test('reducemean_noop_with_empty_axes', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemean_noop_with_empty_axes.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error('Invalid noop_with_empty_axes value 1.'))
	})

	test('reducemean_no_axis', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemean_no_axis.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'mean', input: ['x'], name: 'y', axis: -1, keepdims: true })
	})

	test('reducemean_dummy_init', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemean_dummy_init.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'mean', input: ['x'], name: 'y', axis: [1], keepdims: true })
	})

	test('reducemean_other_node', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemean_other_node.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(4)
		expect(nodes[1]).toEqual({ type: 'const', name: 'axis', value: [1] })
		expect(nodes[2]).toEqual({ type: 'mean', input: ['x'], name: 'y', axis: 'axis', keepdims: true })
	})
})

describe('nn', () => {
	test('reducemean', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemean.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('MeanLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 1])
		for (let i = 0; i < y.rows; i++) {
			let v = 0
			for (let j = 0; j < x.cols; j++) {
				v += x.at(i, j)
			}
			expect(y.at(i, 0)).toBeCloseTo(v / x.cols)
		}
	})

	test('reducemean_not_keepdims', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemean_not_keepdims.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('MeanLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20])
		for (let i = 0; i < y.rows; i++) {
			let v = 0
			for (let j = 0; j < x.cols; j++) {
				v += x.at(i, j)
			}
			expect(y.at(i)).toBeCloseTo(v / x.cols)
		}
	})

	test('reducemean_no_axis', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemean_no_axis.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('MeanLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		expect(y.sizes).toEqual([1, 1])
		let v = 0
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				v += x.at(i, j)
			}
		}
		expect(y.at(0, 0)).toBeCloseTo(v / x.length)
	})

	test('reducemean_dummy_init', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemean_dummy_init.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('MeanLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 1])
		for (let i = 0; i < y.rows; i++) {
			let v = 0
			for (let j = 0; j < x.cols; j++) {
				v += x.at(i, j)
			}
			expect(y.at(i, 0)).toBeCloseTo(v / x.cols)
		}
	})

	test('reducemean_other_node', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemean_other_node.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('MeanLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 1])
		for (let i = 0; i < y.rows; i++) {
			let v = 0
			for (let j = 0; j < x.cols; j++) {
				v += x.at(i, j)
			}
			expect(y.at(i, 0)).toBeCloseTo(v / x.cols)
		}
	})
})
