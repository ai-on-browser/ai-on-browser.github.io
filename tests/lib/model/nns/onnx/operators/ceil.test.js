import fs from 'fs'
import path from 'path'
import url from 'url'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('ceil', async () => {
		const buf = await fs.promises.readFile(`${filepath}/ceil.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'ceil', input: ['x'], name: 'y' })
	})
})

describe('nn', () => {
	test('ceil', async () => {
		const buf = await fs.promises.readFile(`${filepath}/ceil.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('CeilLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBe(Math.ceil(x.at(i, j)))
			}
		}
	})
})
