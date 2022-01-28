import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('lstm', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'lstm', size: 4 }], 'mse', 'adam')
		const x = Tensor.random([1, 7, 5], -0.1, 0.1)
		const t = Matrix.random(1, 4, -0.8, 0.8)

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
