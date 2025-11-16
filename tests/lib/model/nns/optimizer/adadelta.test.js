import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import { AdaDeltaOptimizer } from '../../../../../lib/model/nns/optimizer/adadelta.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('adadelta', () => {
	test('lr', () => {
		const opt = new AdaDeltaOptimizer(0.1)
		const manager = opt.manager()
		expect(manager.lr).toBe(0.1)
	})

	describe('delta', () => {
		test('scalar', () => {
			const opt = new AdaDeltaOptimizer(0.1)
			const manager = opt.manager()
			const beta = 0.95

			let r = 0
			let s = 0
			for (let i = 0; i < 10; i++) {
				const v = Math.random()
				const d = manager.delta('w', v)
				expect(typeof d).toBe('number')
				r = r * beta + v ** 2 * (1 - beta)
				expect(d).toBeCloseTo((0.1 * v * Math.sqrt(s)) / Math.sqrt(r))
				s = s * beta + d ** 2 * (1 - beta)
			}
		})

		test('matrix', () => {
			const opt = new AdaDeltaOptimizer(0.1)
			const manager = opt.manager()
			const beta = 0.95

			const r = Matrix.zeros(10, 3)
			const s = Matrix.zeros(10, 3)
			for (let t = 0; t < 10; t++) {
				const mat = Matrix.randn(10, 3)
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([10, 3])
				r.broadcastOperate(mat, (a, b) => a * beta + b ** 2 * (1 - beta))
				for (let i = 0; i < mat.rows; i++) {
					for (let j = 0; j < mat.cols; j++) {
						expect(d.at(i, j)).toBeCloseTo(
							(0.1 * mat.at(i, j) * Math.sqrt(s.at(i, j))) / Math.sqrt(r.at(i, j))
						)
					}
				}
				s.broadcastOperate(d, (a, b) => a * beta + b ** 2 * (1 - beta))
			}
		})

		test('tensor', () => {
			const opt = new AdaDeltaOptimizer(0.1)
			const manager = opt.manager()
			const beta = 0.95

			const r = Tensor.zeros([7, 5, 3])
			const s = Tensor.zeros([7, 5, 3])
			for (let t = 0; t < 10; t++) {
				const mat = Tensor.randn([7, 5, 3])
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([7, 5, 3])
				r.broadcastOperate(mat, (a, b) => a * beta + b ** 2 * (1 - beta))
				for (let i = 0; i < mat.sizes[0]; i++) {
					for (let j = 0; j < mat.sizes[1]; j++) {
						for (let k = 0; k < mat.sizes[2]; k++) {
							expect(d.at(i, j, k)).toBeCloseTo(
								(0.1 * mat.at(i, j, k) * Math.sqrt(s.at(i, j, k))) / Math.sqrt(r.at(i, j, k))
							)
						}
					}
				}
				s.broadcastOperate(d, (a, b) => a * beta + b ** 2 * (1 - beta))
			}
		})
	})
})

test('nn', { retry: 3, timeout: 10000 }, () => {
	const net = NeuralNetwork.fromObject(
		[
			{ type: 'input', name: 'in' },
			{ type: 'full', out_size: 5, activation: 'sigmoid' },
			{ type: 'full', out_size: 3 },
		],
		'mse',
		'adadelta'
	)
	const x = Matrix.randn(1, 10)
	const t = Matrix.randn(1, 3)

	const losslog = []
	for (let i = 0; i < 100; i++) {
		const loss = net.fit(x, t, 1000, 0.5)
		losslog.push(loss[0])
		if (loss[0] < 1.0e-5) {
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
