import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import { RMSPropOptimizer } from '../../../../../lib/model/nns/optimizer/rmsprop.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('rmsprop', () => {
	test('lr', () => {
		const opt = new RMSPropOptimizer(0.1)
		const manager = opt.manager()
		expect(manager.lr).toBe(0.1)
	})

	describe('delta', () => {
		test('scalar', () => {
			const opt = new RMSPropOptimizer(0.1)
			const manager = opt.manager()
			const beta = 0.999

			let r = 0
			for (let i = 0; i < 10; i++) {
				const v = Math.random()
				const d = manager.delta('w', v)
				expect(typeof d).toBe('number')
				r = r * beta + v ** 2 * (1 - beta)
				expect(d).toBeCloseTo((0.1 * v) / Math.sqrt(r))
			}
		})

		test('matrix', () => {
			const opt = new RMSPropOptimizer(0.1)
			const manager = opt.manager()
			const beta = 0.999

			const r = Matrix.zeros(10, 3)
			for (let i = 0; i < 10; i++) {
				const mat = Matrix.randn(10, 3)
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([10, 3])
				r.broadcastOperate(mat, (a, b) => a * beta + b ** 2 * (1 - beta))
				for (let i = 0; i < mat.rows; i++) {
					for (let j = 0; j < mat.cols; j++) {
						expect(d.at(i, j)).toBeCloseTo((0.1 * mat.at(i, j)) / Math.sqrt(r.at(i, j)))
					}
				}
			}
		})

		test('tensor', () => {
			const opt = new RMSPropOptimizer(0.1)
			const manager = opt.manager()
			const beta = 0.999

			const r = Tensor.zeros([7, 5, 3])
			for (let i = 0; i < 10; i++) {
				const mat = Tensor.randn([7, 5, 3])
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([7, 5, 3])
				r.broadcastOperate(mat, (a, b) => a * beta + b ** 2 * (1 - beta))
				for (let i = 0; i < mat.sizes[0]; i++) {
					for (let j = 0; j < mat.sizes[1]; j++) {
						for (let k = 0; k < mat.sizes[2]; k++) {
							expect(d.at(i, j, k)).toBeCloseTo((0.1 * mat.at(i, j, k)) / Math.sqrt(r.at(i, j, k)))
						}
					}
				}
			}
		})
	})
})

test('nn', () => {
	const net = NeuralNetwork.fromObject(
		[
			{ type: 'input', name: 'in' },
			{ type: 'full', out_size: 5, activation: 'sigmoid' },
			{ type: 'full', out_size: 3 },
		],
		'mse',
		'rmsprop'
	)
	const x = Matrix.randn(1, 10)
	const t = Matrix.randn(1, 3)

	const losslog = []
	for (let i = 0; i < 1000; i++) {
		const loss = net.fit(x, t, 1000, 0.01)
		losslog.push(loss[0])
		if (loss[0] < 1.0e-8) {
			break
		}
		if (losslog.length > 10 && (losslog.at(-10) - loss[0]) / loss[0] < 1.0e-5) {
			throw new Error('Test failed.')
		}
	}

	const y = net.calc(x)
	for (let i = 0; i < 3; i++) {
		expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
	}
})
