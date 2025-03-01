import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('where', async () => {
		const buf = await fs.promises.readFile(`${filepath}/where.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(5)
		expect(nodes[3]).toEqual({ type: 'cond', input: ['condition', 'x1', 'x2'], name: 'y' })
	})
})

describe('nn', () => {
	test('where', async () => {
		const buf = await fs.promises.readFile(`${filepath}/where.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('CondLayer')
		const condition = Matrix.randn(20, 3)
		condition.map(v => v > 0)
		const x1 = Matrix.randn(20, 3)
		const x2 = Matrix.randn(20, 3)

		const y = net.calc({ condition, x1, x2 })
		for (let i = 0; i < x1.rows; i++) {
			for (let j = 0; j < x2.cols; j++) {
				expect(y.at(i, j)).toBe(condition.at(i, j) ? x1.at(i, j) : x2.at(i, j))
			}
		}
	})
})
