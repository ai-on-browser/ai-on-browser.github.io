import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('hardsigmoid', async () => {
		const buf = await fs.promises.readFile(`${filepath}/hardsigmoid.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'hard_sigmoid', input: ['x'], name: 'y' })
	})

	test('hardsigmoid_torch_default', async () => {
		const buf = await fs.promises.readFile(`${filepath}/hardsigmoid_torch_default.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1].type).toBe('hard_sigmoid')
		expect(nodes[1].input).toEqual(['x'])
		expect(nodes[1].name).toBe('y')
		expect(nodes[1].alpha).toBeCloseTo(1 / 6)
		expect(nodes[1].beta).toBe(0.5)
	})
})

describe('nn', () => {
	test('hardsigmoid', async () => {
		const buf = await fs.promises.readFile(`${filepath}/hardsigmoid.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('HardSigmoidLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.max(0, Math.min(1, 0.2 * x.at(i, j) + 0.5)))
			}
		}
	})

	test('hardsigmoid_torch_default', async () => {
		const buf = await fs.promises.readFile(`${filepath}/hardsigmoid_torch_default.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('HardSigmoidLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.max(0, Math.min(1, x.at(i, j) / 6 + 0.5)))
			}
		}
	})
})
