import fs from 'fs'
import path from 'path'
import url from 'url'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('bitshift_left', async () => {
		const buf = await fs.promises.readFile(`${filepath}/bitshift_left.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(4)
		expect(nodes[2]).toEqual({ type: 'left_bitshift', input: ['x1', 'x2'], name: 'y' })
	})

	test('bitshift_right', async () => {
		const buf = await fs.promises.readFile(`${filepath}/bitshift_right.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(4)
		expect(nodes[2]).toEqual({ type: 'right_bitshift', input: ['x1', 'x2'], name: 'y' })
	})
})

describe('nn', () => {
	test('bitshift_left', async () => {
		const buf = await fs.promises.readFile(`${filepath}/bitshift_left.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LeftBitshiftLayer')
		const x1 = Matrix.randint(20, 3, 0, 255)
		const x2 = Matrix.randint(20, 3, 0, 8)

		const y = net.calc({ x1, x2 })
		for (let i = 0; i < x1.rows; i++) {
			for (let j = 0; j < x1.cols; j++) {
				expect(y.at(i, j)).toBe(x1.at(i, j) << x2.at(i, j))
			}
		}
	})

	test('bitshift_right', async () => {
		const buf = await fs.promises.readFile(`${filepath}/bitshift_right.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('RightBitshiftLayer')
		const x1 = Matrix.randint(20, 3, 0, 255)
		const x2 = Matrix.randint(20, 3, 0, 8)

		const y = net.calc({ x1, x2 })
		for (let i = 0; i < x1.rows; i++) {
			for (let j = 0; j < x1.cols; j++) {
				expect(y.at(i, j)).toBe(x1.at(i, j) >> x2.at(i, j))
			}
		}
	})
})
