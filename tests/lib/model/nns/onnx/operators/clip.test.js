import fs from 'fs'
import path from 'path'
import url from 'url'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('clip', async () => {
		const buf = await fs.promises.readFile(`${filepath}/clip.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'clip', input: ['x'], name: 'y', min: 0, max: 1 })
	})

	test('clip_min', async () => {
		const buf = await fs.promises.readFile(`${filepath}/clip_min.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'clip', input: ['x'], name: 'y', min: 0 })
	})

	test('clip_max', async () => {
		const buf = await fs.promises.readFile(`${filepath}/clip_max.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'clip', input: ['x'], name: 'y', max: 0 })
	})

	test('clip_other_node', async () => {
		const buf = await fs.promises.readFile(`${filepath}/clip_other_node.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(5)
		expect(nodes[1]).toEqual({ type: 'const', name: 'min', value: 0 })
		expect(nodes[2]).toEqual({ type: 'const', name: 'max', value: 1 })
		expect(nodes[3]).toEqual({ type: 'clip', input: ['x'], name: 'y', min: 'min', max: 'max' })
	})
})

describe('nn', () => {
	test('clip', async () => {
		const buf = await fs.promises.readFile(`${filepath}/clip.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ClipLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.max(0, Math.min(1, x.at(i, j))))
			}
		}
	})

	test('clip_min', async () => {
		const buf = await fs.promises.readFile(`${filepath}/clip_min.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ClipLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.max(0, x.at(i, j)))
			}
		}
	})

	test('clip_max', async () => {
		const buf = await fs.promises.readFile(`${filepath}/clip_max.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ClipLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.min(0, x.at(i, j)))
			}
		}
	})

	test('clip_other_node', async () => {
		const buf = await fs.promises.readFile(`${filepath}/clip_other_node.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ClipLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.max(0, Math.min(1, x.at(i, j))))
			}
		}
	})
})
