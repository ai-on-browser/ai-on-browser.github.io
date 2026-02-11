import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('asin', async () => {
		const buf = await fs.promises.readFile(`${filepath}/asin.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'asin', input: ['x'], name: 'y' })
	})
})

describe('nn', () => {
	test('asin', async () => {
		const buf = await fs.promises.readFile(`${filepath}/asin.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('AsinLayer')
		const x = Matrix.random(20, 3, -1, 1)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.asin(x.at(i, j)))
			}
		}
	})
})
