import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('reducemax', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemax.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'reduce_max', input: ['x'], name: 'y', axis: [1], keepdims: true })
	})

	test('reducemax_not_keepdims', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemax_not_keepdims.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'reduce_max', input: ['x'], name: 'y', axis: [1], keepdims: false })
	})

	test('reducemax_noop_with_empty_axes', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemax_noop_with_empty_axes.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error('Invalid noop_with_empty_axes value 1.'))
	})
})

describe('nn', () => {
	test('reducemax', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemax.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ReduceMaxLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 1])
		for (let i = 0; i < y.rows; i++) {
			let v = -Infinity
			for (let j = 0; j < x.cols; j++) {
				v = Math.max(v, x.at(i, j))
			}
			expect(y.at(i, 0)).toBeCloseTo(v)
		}
	})

	test('reducemax_not_keepdims', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reducemax_not_keepdims.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ReduceMaxLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20])
		for (let i = 0; i < y.rows; i++) {
			let v = -Infinity
			for (let j = 0; j < x.cols; j++) {
				v = Math.max(v, x.at(i, j))
			}
			expect(y.at(i)).toBeCloseTo(v)
		}
	})
})
