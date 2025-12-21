import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import { AMSGradOptimizer } from '../../../../../lib/model/nns/optimizer/amsgrad.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('amsgrad', () => {
	test('lr', () => {
		const opt = new AMSGradOptimizer(0.1)
		const manager = opt.manager()
		expect(manager.lr).toBe(0.1)
	})

	describe('delta', () => {
		test('scalar', () => {
			const opt = new AMSGradOptimizer(0.1)
			const manager = opt.manager()
			const beta1 = 0.9
			const beta2 = 0.999

			let m = 0
			let v = 0
			let vh = 0
			for (let i = 0; i < 10; i++) {
				const x = Math.random()
				const d = manager.delta('w', x)
				expect(typeof d).toBe('number')
				m = m * beta1 + x * (1 - beta1)
				v = v * beta2 + x ** 2 * (1 - beta2)
				vh = Math.max(vh, v)
				expect(d).toBeCloseTo(((0.1 / Math.sqrt(i + 1)) * m) / Math.sqrt(vh))
			}
		})

		test('matrix', () => {
			const opt = new AMSGradOptimizer(0.1)
			const manager = opt.manager()
			const beta1 = 0.9
			const beta2 = 0.999

			const m = Matrix.zeros(10, 3)
			const v = Matrix.zeros(10, 3)
			const vh = Matrix.zeros(10, 3)
			for (let t = 0; t < 10; t++) {
				const mat = Matrix.randn(10, 3)
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([10, 3])
				m.broadcastOperate(mat, (a, b) => a * beta1 + b * (1 - beta1))
				v.broadcastOperate(mat, (a, b) => a * beta2 + b ** 2 * (1 - beta2))
				vh.broadcastOperate(v, (a, b) => Math.max(a, b))
				for (let i = 0; i < mat.rows; i++) {
					for (let j = 0; j < mat.cols; j++) {
						expect(d.at(i, j)).toBeCloseTo(((0.1 / Math.sqrt(t + 1)) * m.at(i, j)) / Math.sqrt(vh.at(i, j)))
					}
				}
			}
		})

		test('tensor', { retry: 3 }, () => {
			const opt = new AMSGradOptimizer(0.1)
			const manager = opt.manager()
			const beta1 = 0.9
			const beta2 = 0.999

			const m = Tensor.zeros([7, 5, 3])
			const v = Tensor.zeros([7, 5, 3])
			const vh = Tensor.zeros([7, 5, 3])
			for (let t = 0; t < 10; t++) {
				const mat = Tensor.randn([7, 5, 3])
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([7, 5, 3])
				m.broadcastOperate(mat, (a, b) => a * beta1 + b * (1 - beta1))
				v.broadcastOperate(mat, (a, b) => a * beta2 + b ** 2 * (1 - beta2))
				vh.broadcastOperate(v, (a, b) => Math.max(a, b))
				for (let i = 0; i < mat.sizes[0]; i++) {
					for (let j = 0; j < mat.sizes[1]; j++) {
						for (let k = 0; k < mat.sizes[2]; k++) {
							expect(d.at(i, j, k)).toBeCloseTo(
								((0.1 / Math.sqrt(t + 1)) * m.at(i, j, k)) / Math.sqrt(vh.at(i, j, k))
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
		'amsgrad'
	)
	const x = Matrix.randn(1, 10)
	const t = Matrix.randn(1, 3)

	const losslog = []
	for (let i = 0; i < 100; i++) {
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
