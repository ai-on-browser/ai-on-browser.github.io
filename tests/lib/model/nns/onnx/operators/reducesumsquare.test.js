import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('reducesumsquare', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducesumsquare.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(4)
		expect(nodes[1]).toEqual({ type: 'square', input: ['x'] })
		expect(nodes[2]).toEqual({ type: 'sum', name: 'y', axis: [1], keepdims: true })
	})

	test('reducesumsquare_not_keepdims', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducesumsquare_not_keepdims.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(4)
		expect(nodes[1]).toEqual({ type: 'square', input: ['x'] })
		expect(nodes[2]).toEqual({ type: 'sum', name: 'y', axis: [1], keepdims: false })
	})

	test('reducesumsquare_noop_with_empty_axes', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducesumsquare_noop_with_empty_axes.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error('Invalid noop_with_empty_axes value 1.'))
	})
})

describe('nn', () => {
	test('reducesumsquare', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducesumsquare.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('SumLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 1])
		for (let i = 0; i < y.rows; i++) {
			let v = 0
			for (let j = 0; j < x.cols; j++) {
				v += x.at(i, j) ** 2
			}
			expect(y.at(i, 0)).toBeCloseTo(v)
		}
	})

	test('reducesumsquare_not_keepdims', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducesumsquare_not_keepdims.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('SumLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20])
		for (let i = 0; i < y.rows; i++) {
			let v = 0
			for (let j = 0; j < x.cols; j++) {
				v += x.at(i, j) ** 2
			}
			expect(y.at(i)).toBeCloseTo(v)
		}
	})
})
