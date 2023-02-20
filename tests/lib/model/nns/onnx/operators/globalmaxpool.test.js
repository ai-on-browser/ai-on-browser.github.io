import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import Tensor from '../../../../../../lib/util/tensor.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('globalmaxpool', async () => {
		const buf = await fs.promises.readFile(`${filepath}/globalmaxpool.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'global_max_pool', input: ['x'], name: 'y', channel_dim: 1 })
	})
})

describe('nn', () => {
	test('globalmaxpool', async () => {
		const buf = await fs.promises.readFile(`${filepath}/globalmaxpool.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('GlobalMaxPoolLayer')
		const x = Tensor.randn([20, 2, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 1, 1])
	})
})
