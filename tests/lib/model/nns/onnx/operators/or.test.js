import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('or', async () => {
		const buf = await fs.promises.readFile(`${filepath}/or.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(4)
		expect(nodes[2]).toEqual({ type: 'or', input: ['x1', 'x2'], name: 'y' })
	})
})

describe('nn', () => {
	test('or', async () => {
		const buf = await fs.promises.readFile(`${filepath}/or.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('OrLayer')
		const x1 = new Matrix(4, 1, [false, false, true, true])
		const x2 = new Matrix(4, 1, [false, true, false, true])

		const y = net.calc({ x1, x2 })
		expect(y.value).toEqual([false, true, true, true])
	})
})
