import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Tensor from '../../../../../../lib/util/tensor.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('reshape', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reshape.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'reshape', input: ['x'], name: 'y', size: [10] })
	})

	test('reshape_no_neg', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reshape_no_neg.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'reshape', input: ['x'], name: 'y', size: [2, 5] })
	})

	test('reshape_vals_mid_neg', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reshape_vals_mid_neg.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error('Invalid shape value [10,-1].'))
	})
})

describe('nn', () => {
	test('reshape', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reshape.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ReshapeLayer')
		const x = Tensor.randn([20, 5, 2])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 10])
		for (let i = 0; i < y.rows; i++) {
			for (let j = 0; j < y.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, Math.floor(j / 2), j % 2))
			}
		}
	})

	test('reshape_no_neg', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reshape_no_neg.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ReshapeLayer')
		const x = Tensor.randn([20, 5, 2])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 5])
		for (let i = 0; i < y.sizes[0]; i++) {
			for (let j = 0; j < y.sizes[1] * y.sizes[2]; j++) {
				expect(y.at(i, Math.floor(j / 5), j % 5)).toBeCloseTo(x.at(i, Math.floor(j / 2), j % 2))
			}
		}
	})
})
