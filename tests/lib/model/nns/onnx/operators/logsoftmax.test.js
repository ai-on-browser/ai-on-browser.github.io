import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'
import Tensor from '../../../../../../lib/util/tensor.js'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('logsoftmax', async () => {
		const buf = await fs.promises.readFile(`${filepath}/logsoftmax.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'log_softmax', input: ['x'], name: 'y', axis: -1 })
	})

	test('logsoftmax_axis_2', async () => {
		const buf = await fs.promises.readFile(`${filepath}/logsoftmax_axis_2.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'log_softmax', input: ['x'], name: 'y', axis: 2 })
	})
})

describe('nn', () => {
	test('logsoftmax', async () => {
		const buf = await fs.promises.readFile(`${filepath}/logsoftmax.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LogSoftmaxLayer')
		const x = Matrix.randn(20, 3)
		const sm = Matrix.map(x, Math.exp)
		sm.div(sm.sum(1))
		sm.map(Math.log)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(sm.at(i, j))
			}
		}
	})

	test('logsoftmax_axis_2', async () => {
		const buf = await fs.promises.readFile(`${filepath}/logsoftmax_axis_2.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LogSoftmaxLayer')
		const x = Tensor.randn([15, 10, 7])

		const y = net.calc(x)
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let j = 0; j < x.sizes[1]; j++) {
				const v = []
				for (let k = 0; k < x.sizes[2]; k++) {
					v[k] = Math.exp(x.at(i, j, k))
				}
				const s = v.reduce((s, v) => s + v)
				for (let k = 0; k < x.sizes[2]; k++) {
					expect(y.at(i, j, k)).toBeCloseTo(Math.log(v[k] / s))
				}
			}
		}
	})
})
