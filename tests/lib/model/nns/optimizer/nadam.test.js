import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import { NadamOptimizer } from '../../../../../lib/model/nns/optimizer/nadam.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('adam', () => {
	test('lr', () => {
		const opt = new NadamOptimizer(0.1)
		const manager = opt.manager()
		expect(manager.lr).toBe(0.1)
	})

	describe('delta', () => {
		test('scalar', () => {
			const opt = new NadamOptimizer(0.1)
			const manager = opt.manager()
			const mu = 0.975
			const nu = 0.999

			let m = 0
			let s = 0
			for (let i = 0; i < 10; i++) {
				const v = Math.random()
				const d = manager.delta('w', v)
				expect(typeof d).toBe('number')
				m = m * mu + v * (1 - mu)
				s = s * nu + v ** 2 * (1 - nu)
				const mh = (mu / (1 - mu ** (i + 2))) * m + ((1 - mu) / (1 - mu ** (i + 1))) * v
				const vh = (nu / (1 - nu ** (i + 1))) * s
				expect(d).toBeCloseTo((0.1 * mh) / Math.sqrt(vh))
			}
		})

		test('matrix', () => {
			const opt = new NadamOptimizer(0.1)
			const manager = opt.manager()
			const mu = 0.975
			const nu = 0.999

			const m = Matrix.zeros(10, 3)
			const s = Matrix.zeros(10, 3)
			for (let t = 0; t < 10; t++) {
				const mat = Matrix.randn(10, 3)
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([10, 3])
				m.broadcastOperate(mat, (a, b) => a * mu + b * (1 - mu))
				s.broadcastOperate(mat, (a, b) => a * nu + b ** 2 * (1 - nu))
				const mh = Matrix.add(
					Matrix.mult(m, mu / (1 - mu ** (t + 2))),
					Matrix.mult(mat, (1 - mu) / (1 - mu ** (t + 1)))
				)
				const vh = Matrix.mult(s, nu / (1 - nu ** (t + 1)))
				for (let i = 0; i < mat.rows; i++) {
					for (let j = 0; j < mat.cols; j++) {
						expect(d.at(i, j)).toBeCloseTo((0.1 * mh.at(i, j)) / Math.sqrt(vh.at(i, j)))
					}
				}
			}
		})

		test('tensor', () => {
			const opt = new NadamOptimizer(0.1)
			const manager = opt.manager()
			const mu = 0.975
			const nu = 0.999

			const m = Tensor.zeros([7, 5, 3])
			const s = Tensor.zeros([7, 5, 3])
			for (let t = 0; t < 10; t++) {
				const mat = Tensor.randn([7, 5, 3])
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([7, 5, 3])
				m.broadcastOperate(mat, (a, b) => a * mu + b * (1 - mu))
				s.broadcastOperate(mat, (a, b) => a * nu + b ** 2 * (1 - nu))
				const mh = m.copy()
				mh.broadcastOperate(
					mat,
					(a, b) => (a * mu) / (1 - mu ** (t + 2)) + (b * (1 - mu)) / (1 - mu ** (t + 1))
				)
				const vh = s.copy()
				vh.map(v => (v * nu) / (1 - nu ** (t + 1)))
				for (let i = 0; i < mat.sizes[0]; i++) {
					for (let j = 0; j < mat.sizes[1]; j++) {
						for (let k = 0; k < mat.sizes[2]; k++) {
							expect(d.at(i, j, k)).toBeCloseTo((0.1 * mh.at(i, j, k)) / Math.sqrt(vh.at(i, j, k)))
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
		'nadam'
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
