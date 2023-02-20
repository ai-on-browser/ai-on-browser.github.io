import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Tensor from '../../../../../../lib/util/tensor.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('flatten', async () => {
		const buf = await fs.promises.readFile(`${filepath}/flatten.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'flatten', input: ['x'], name: 'y' })
	})

	test('flatten_axis_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/flatten_axis_1.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'flatten', input: ['x'], name: 'y' })
	})

	test('flatten_axis_2', async () => {
		const buf = await fs.promises.readFile(`${filepath}/flatten_axis_2.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'axis' value 2."))
	})
})

describe('nn', () => {
	test('flatten', async () => {
		const buf = await fs.promises.readFile(`${filepath}/flatten.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('FlattenLayer')
		const x = Tensor.randn([20, 3, 3])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 9])
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBe(x.at(i, Math.floor(j / 3), j % 3))
			}
		}
	})

	test('flatten_axis_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/flatten_axis_1.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('FlattenLayer')
		const x = Tensor.randn([20, 3, 3])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 9])
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBe(x.at(i, Math.floor(j / 3), j % 3))
			}
		}
	})
})
