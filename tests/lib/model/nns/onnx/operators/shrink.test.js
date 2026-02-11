import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('shrink_hard', async () => {
		const buf = await fs.promises.readFile(`${filepath}/shrink_hard.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'hard_shrink', input: ['x'], name: 'y', l: 0.5 })
	})

	test('shrink_soft', async () => {
		const buf = await fs.promises.readFile(`${filepath}/shrink_soft.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'soft_shrink', input: ['x'], name: 'y', l: 1 })
	})

	test('shrink_other', async () => {
		const buf = await fs.promises.readFile(`${filepath}/shrink_other.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'bias' value 0.5."))
	})
})

describe('nn', () => {
	test('shrink_hard', async () => {
		const buf = await fs.promises.readFile(`${filepath}/shrink_hard.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('HardShrinkLayer')
		const x = Matrix.randn(100, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([100, 10])
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBe(x.at(i, j) < -0.5 || x.at(i, j) > 0.5 ? x.at(i, j) : 0)
			}
		}
	})

	test('shrink_soft', async () => {
		const buf = await fs.promises.readFile(`${filepath}/shrink_soft.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('SoftShrinkLayer')
		const x = Matrix.randn(100, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([100, 10])
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBe(x.at(i, j) < -1 ? x.at(i, j) + 1 : x.at(i, j) > 1 ? x.at(i, j) - 1 : 0)
			}
		}
	})
})
