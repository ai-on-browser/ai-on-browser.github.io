import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('softplus', async () => {
		const buf = await fs.promises.readFile(`${filepath}/softplus.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'softplus', input: ['x'], name: 'y', beta: 1 })
	})
})

describe('nn', () => {
	test('softplus', async () => {
		const buf = await fs.promises.readFile(`${filepath}/softplus.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('SoftplusLayer')
		const x = Matrix.random(20, 3, 0, 5)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.log(Math.exp(x.at(i, j)) + 1))
			}
		}
	})
})
