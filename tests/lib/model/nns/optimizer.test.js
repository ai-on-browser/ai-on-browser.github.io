import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../lib/util/matrix.js'

import {
	SGDOptimizer,
	MomentumOptimizer,
	RMSPropOptimizer,
	AdamOptimizer,
} from '../../../../lib/model/nns/optimizer.js'
import Tensor from '../../../../lib/util/tensor.js'

describe.each([SGDOptimizer, MomentumOptimizer, RMSPropOptimizer, AdamOptimizer])('%p', optimizer => {
	test('lr', () => {
		const opt = new optimizer(0.1)
		const manager = opt.manager()
		expect(manager.lr).toBe(0.1)
	})

	describe('delta', () => {
		test('scalar', () => {
			const opt = new optimizer(0.1)
			const manager = opt.manager()

			const d = manager.delta('w', 1)
			expect(typeof d).toBe('number')
		})

		test('matrix', () => {
			const opt = new optimizer(0.1)
			const manager = opt.manager()

			const mat = Matrix.randn(10, 3)
			const d = manager.delta('w', mat)
			expect(d.sizes).toEqual([10, 3])
		})

		test('tensor', () => {
			const opt = new optimizer(0.1)
			const manager = opt.manager()

			const mat = Tensor.randn([10, 5, 3])
			const d = manager.delta('w', mat)
			expect(d.sizes).toEqual([10, 5, 3])
		})
	})
})

describe('nn', () => {
	test.each(['sgd', 'momentum', 'rmsprop', 'adam'])('%s', optimizer => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'full', out_size: 5, activation: 'sigmoid' },
				{ type: 'full', out_size: 3 },
			],
			'mse',
			optimizer
		)
		const x = Matrix.randn(1, 10)
		const t = Matrix.randn(1, 3)

		for (let i = 0; i < 1000; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < 3; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})
