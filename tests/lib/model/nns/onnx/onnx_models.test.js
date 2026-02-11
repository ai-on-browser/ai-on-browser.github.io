import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

import NeuralNetwork from '../../../../../lib/model/neuralnetwork'
import Tensor from '../../../../../lib/util/tensor.js'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('import', () => {
	test('mnist-12.onnx', async () => {
		const buf = await fs.promises.readFile(`${filepath}/models/mnist-12.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)

		const x = Tensor.randn([2, 1, 24, 24])
		const y = net.calc(x).toArray()
		expect(y).toHaveLength(2)
		for (let i = 0; i < 2; i++) {
			expect(y[i]).toHaveLength(1)
			expect(y[i][0]).toHaveLength(10)
		}
	})

	test('squeezenet1.0-12.onnx', { timeout: 60000 }, async () => {
		const buf = await fs.promises.readFile(`${filepath}/models/squeezenet1.0-12.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net).toBeDefined()
	})
})
