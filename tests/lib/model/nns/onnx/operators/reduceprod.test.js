import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('reduceprod', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reduceprod.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'prod', input: ['x'], name: 'y', axis: [1], keepdims: true })
	})

	test('reduceprod_not_keepdims', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reduceprod_not_keepdims.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'prod', input: ['x'], name: 'y', axis: [1], keepdims: false })
	})

	test('reduceprod_noop_with_empty_axes', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reduceprod_noop_with_empty_axes.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error('Invalid noop_with_empty_axes value 1.'))
	})
})

describe('nn', () => {
	test('reduceprod', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reduceprod.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ProdLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 1])
		for (let i = 0; i < y.rows; i++) {
			let v = 1
			for (let j = 0; j < x.cols; j++) {
				v *= x.at(i, j)
			}
			expect(y.at(i, 0)).toBeCloseTo(v)
		}
	})

	test('reduceprod_not_keepdims', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reduceprod_not_keepdims.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ProdLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20])
		for (let i = 0; i < y.rows; i++) {
			let v = 1
			for (let j = 0; j < x.cols; j++) {
				v *= x.at(i, j)
			}
			expect(y.at(i)).toBeCloseTo(v)
		}
	})
})
