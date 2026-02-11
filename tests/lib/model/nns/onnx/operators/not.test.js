import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('not', async () => {
		const buf = await fs.promises.readFile(`${filepath}/not.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'not', input: ['x'], name: 'y' })
	})
})

describe('nn', () => {
	test('not', async () => {
		const buf = await fs.promises.readFile(`${filepath}/not.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('NotLayer')
		const x = Matrix.randint(20, 3, 0, 1)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBe(!x.at(i, j))
			}
		}
	})
})
