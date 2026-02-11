import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'
import Tensor from '../../../../../../lib/util/tensor.js'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('argmax', async () => {
		const buf = await fs.promises.readFile(`${filepath}/argmax.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'argmax', input: ['x'], name: 'y', axis: 0, keepdims: true })
	})

	test('argmax_axis_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/argmax_axis_1.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'argmax', input: ['x'], name: 'y', axis: 1, keepdims: true })
	})

	test('argmax_axis_2', async () => {
		const buf = await fs.promises.readFile(`${filepath}/argmax_axis_2.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'argmax', input: ['x'], name: 'y', axis: 2, keepdims: true })
	})

	test('argmax_select_last_index', async () => {
		const buf = await fs.promises.readFile(`${filepath}/argmax_select_last_index.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(
			new Error("Invalid attribute 'select_last_index' value 1.")
		)
	})
})

describe('nn', () => {
	test('argmax', async () => {
		const buf = await fs.promises.readFile(`${filepath}/argmax.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ArgmaxLayer')
		const x = Matrix.randn(20, 3)
		const am = x.argmax(0)

		const y = net.calc(x)
		for (let i = 0; i < x.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(am.at(0, i))
		}
	})

	test('argmax_axis_1', async () => {
		const buf = await fs.promises.readFile(`${filepath}/argmax_axis_1.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ArgmaxLayer')
		const x = Matrix.randn(20, 3)
		const am = x.argmax(1)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			expect(y.at(i, 0)).toBeCloseTo(am.at(i, 0))
		}
	})

	test('argmax_axis_2', async () => {
		const buf = await fs.promises.readFile(`${filepath}/argmax_axis_2.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ArgmaxLayer')
		const x = Tensor.randn([15, 10, 7])

		const y = net.calc(x)
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let j = 0; j < x.sizes[1]; j++) {
				let max_v = -Infinity
				let max_k = -1
				for (let k = 0; k < x.sizes[2]; k++) {
					if (max_v < x.at(i, j, k)) {
						max_v = x.at(i, j, k)
						max_k = k
					}
				}
				expect(y.at(i, j, 0)).toBe(max_k)
			}
		}
	})
})
