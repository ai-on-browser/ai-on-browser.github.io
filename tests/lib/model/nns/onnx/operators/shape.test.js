import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Tensor from '../../../../../../lib/util/tensor.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('shape', async () => {
		const buf = await fs.promises.readFile(`${filepath}/shape.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'shape', input: ['x'], name: 'y' })
	})

	test('shape_with_start_0', async () => {
		const buf = await fs.promises.readFile(`${filepath}/shape_with_start_0.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'shape', input: ['x'], name: 'y' })
	})

	test('shape_with_start_-1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/shape_with_start_-1.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'start' value -1."))
	})

	test('shape_with_end_0', async () => {
		const buf = await fs.promises.readFile(`${filepath}/shape_with_end_0.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'end' value 0."))
	})
})

describe('nn', () => {
	test('shape', async () => {
		const buf = await fs.promises.readFile(`${filepath}/shape.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ShapeLayer')
		const x = Tensor.randn([20, 5, 2])

		const y = net.calc(x)
		expect(y.sizes).toEqual([3])
		expect(y.toArray()).toEqual([20, 5, 2])
	})

	test('shape_with_start_0', async () => {
		const buf = await fs.promises.readFile(`${filepath}/shape_with_start_0.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ShapeLayer')
		const x = Tensor.randn([20, 5, 2])

		const y = net.calc(x)
		expect(y.sizes).toEqual([3])
		expect(y.toArray()).toEqual([20, 5, 2])
	})
})
