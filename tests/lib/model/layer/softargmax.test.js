import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../lib/util/matrix.js'

describe('softargmax', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'softargmax' }])
		const x = Matrix.random(10, 10, 0, 1)

		const y = net.calc(x)
		const t = x.argmax(1)
		for (let i = 0; i < t.rows; i++) {
			for (let j = 0; j < t.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(t.at(i, j), 1)
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 7 }, { type: 'softargmax' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = new Matrix(1, 1, Math.floor(Math.random() * 7))

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.rows; i++) {
			expect(y.at(i, 0)).toBeCloseTo(t.at(i, 0))
		}
	})
})
