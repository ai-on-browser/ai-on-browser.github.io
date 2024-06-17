import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import { AdaBeliefOptimizer } from '../../../../../lib/model/nns/optimizer/adabelief.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('adabelief', () => {
	test('lr', () => {
		const opt = new AdaBeliefOptimizer(0.1)
		const manager = opt.manager()
		expect(manager.lr).toBe(0.1)
	})

	describe('delta', () => {
		test('scalar', () => {
			const opt = new AdaBeliefOptimizer(0.1)
			const manager = opt.manager()
			const beta1 = 0.9
			const beta2 = 0.999

			let r = 0
			let s = 0
			for (let i = 0; i < 10; i++) {
				const v = Math.random()
				const d = manager.delta('w', v)
				expect(typeof d).toBe('number')
				r = r * beta1 + v * (1 - beta1)
				s = s * beta2 + (r - v) ** 2 * (1 - beta2)
				expect(d).toBeCloseTo((0.1 * (r / (1 - beta1 ** (i + 1)))) / Math.sqrt(s / (1 - beta2 ** (i + 1))))
			}
		})

		test('matrix', () => {
			const opt = new AdaBeliefOptimizer(0.1)
			const manager = opt.manager()
			const beta1 = 0.9
			const beta2 = 0.999

			const r = Matrix.zeros(10, 3)
			const s = Matrix.zeros(10, 3)
			for (let t = 0; t < 10; t++) {
				const mat = Matrix.randn(10, 3)
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([10, 3])
				r.broadcastOperate(mat, (a, b) => a * beta1 + b * (1 - beta1))
				s.map((v, i) => v * beta2 + (r.at(i) - mat.at(i)) ** 2 * (1 - beta2))
				for (let i = 0; i < mat.rows; i++) {
					for (let j = 0; j < mat.cols; j++) {
						expect(d.at(i, j)).toBeCloseTo(
							(0.1 * (r.at(i, j) / (1 - beta1 ** (t + 1)))) /
								Math.sqrt(s.at(i, j) / (1 - beta2 ** (t + 1)))
						)
					}
				}
			}
		})

		test('tensor', () => {
			const opt = new AdaBeliefOptimizer(0.1)
			const manager = opt.manager()
			const beta1 = 0.9
			const beta2 = 0.999

			const r = Tensor.zeros([7, 5, 3])
			const s = Tensor.zeros([7, 5, 3])
			for (let t = 0; t < 10; t++) {
				const mat = Tensor.randn([7, 5, 3])
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([7, 5, 3])
				r.broadcastOperate(mat, (a, b) => a * beta1 + b * (1 - beta1))
				const mo = r.copy()
				mo.broadcastOperate(mat, (a, b) => a - b)
				s.broadcastOperate(mo, (a, b) => a * beta2 + b ** 2 * (1 - beta2))
				for (let i = 0; i < mat.sizes[0]; i++) {
					for (let j = 0; j < mat.sizes[1]; j++) {
						for (let k = 0; k < mat.sizes[2]; k++) {
							expect(d.at(i, j, k)).toBeCloseTo(
								(0.1 * (r.at(i, j, k) / (1 - beta1 ** (t + 1)))) /
									Math.sqrt(s.at(i, j, k) / (1 - beta2 ** (t + 1)))
							)
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
		'adabelief'
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
