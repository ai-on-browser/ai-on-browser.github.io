import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Tensor from '../../../../../../lib/util/tensor.js'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('lrn', async () => {
		const buf = await fs.promises.readFile(`${filepath}/lrn.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({
			type: 'lrn',
			input: ['x'],
			name: 'y',
			alpha: 0.0001,
			beta: 0.75,
			channel_dim: 1,
			k: 1,
			n: 2,
		})
	})
})

describe('nn', () => {
	test('lrn', async () => {
		const buf = await fs.promises.readFile(`${filepath}/lrn.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LRNLayer')
		const x = Tensor.randn([20, 10, 10, 5])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 10, 10, 5])
	})
})
