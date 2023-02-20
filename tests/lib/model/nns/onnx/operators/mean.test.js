import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('mean', async () => {
		const buf = await fs.promises.readFile(`${filepath}/mean.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(7)
		expect(nodes[3]).toEqual({ type: 'add', input: ['x', 'const1', 'const2'], name: 'y_sum' })
		expect(nodes[4]).toEqual({ type: 'const', input: [], name: 'y_den', value: 3 })
		expect(nodes[5]).toEqual({ type: 'div', input: ['y_sum', 'y_den'], name: 'y' })
	})
})

describe('nn', () => {
	test('mean', async () => {
		const buf = await fs.promises.readFile(`${filepath}/mean.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('AddLayer')
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('DivLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo((x.at(i, j) + 4) / 3)
			}
		}
	})
})
