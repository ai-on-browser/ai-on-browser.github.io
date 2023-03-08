import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('pow', async () => {
		const buf = await fs.promises.readFile(`${filepath}/pow.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(4)
		expect(nodes[1].type).toBe('const')
		expect(nodes[1].value).toBe(2)
		expect(nodes[2].type).toBe('power')
		expect(nodes[2].input).toEqual(['x', 'exponent'])
		expect(nodes[2].name).toBe('y')
	})

	test('pow_exponent_array', async () => {
		const buf = await fs.promises.readFile(`${filepath}/pow_exponent_array.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(4)
		expect(nodes[1].type).toBe('const')
		expect(nodes[1].value).toEqual([2, 2, 2])
		expect(nodes[2].type).toBe('power')
		expect(nodes[2].input).toEqual(['x', 'exponent'])
		expect(nodes[2].name).toBe('y')
	})
})

describe('nn', () => {
	test('pow', async () => {
		const buf = await fs.promises.readFile(`${filepath}/pow.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('PowerLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) ** 2)
			}
		}
	})

	test('pow_exponent_array', async () => {
		const buf = await fs.promises.readFile(`${filepath}/pow_exponent_array.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('PowerLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) ** 2)
			}
		}
	})
})
