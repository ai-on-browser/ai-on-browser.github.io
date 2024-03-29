import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('xor', async () => {
		const buf = await fs.promises.readFile(`${filepath}/xor.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(4)
		expect(nodes[2]).toEqual({ type: 'xor', input: ['x1', 'x2'], name: 'y' })
	})
})

describe('nn', () => {
	test('xor', async () => {
		const buf = await fs.promises.readFile(`${filepath}/xor.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('XorLayer')
		const x1 = new Matrix(4, 1, [false, false, true, true])
		const x2 = new Matrix(4, 1, [false, true, false, true])

		const y = net.calc({ x1, x2 })
		expect(y.value).toEqual([false, true, true, false])
	})
})
