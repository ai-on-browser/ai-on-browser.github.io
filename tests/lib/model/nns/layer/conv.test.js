import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('conv', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'conv', kernel: 3, padding: 1 }, { type: 'flatten' }],
			'mse',
			'adam'
		)
		const x = Tensor.randn([1, 3, 3, 2]).toArray()
		const t = Matrix.randn(1, 36)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})
