import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import { SantaSSSOptimizer } from '../../../../../lib/model/nns/optimizer/santasss.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('santasss', () => {
	test('lr', () => {
		const opt = new SantaSSSOptimizer(0.1)
		const manager = opt.manager()
		expect(manager.lr).toBe(0.1)
	})

	describe('delta', () => {
		test('scalar', () => {
			const opt = new SantaSSSOptimizer(0.1, 0.95, 5)
			opt._z = () => 0.02
			const manager = opt.manager()
			const sigma = 0.95
			const c = 5
			const n = 16
			const lambda = 0.01
			const burnin = 5
			const lr = 0.1

			let v = 0
			let g = 0
			let a = Math.sqrt(lr) * c
			let u = Math.sqrt(lr) * 0.02
			for (let t = 0; t < 10; t++) {
				const x = Math.random() / (t + 1)
				const d = manager.delta('w', x)
				expect(typeof d).toBe('number')
				v = v * sigma + ((1 - sigma) / n ** 2) * x ** 2
				const gp = g
				const up = u
				g = 1 / Math.sqrt(lambda + Math.sqrt(v))
				if (t < burnin - 1) {
					const beta = (t + 1) ** 0.5
					a += (u ** 2 - lr / beta) / 2
					u = Math.exp(-a / 2) * u
					u += -g * x * lr + Math.sqrt((2 * gp * lr) / beta) * 0.02 + ((lr / beta) * (1 - gp / g)) / up
					u = Math.exp(-a / 2) * u
					a += (u ** 2 - lr / beta) / 2
				} else {
					u = Math.exp(-a / 2) * u
					u -= g * x * lr
					u = Math.exp(-a / 2) * u
				}
				expect(d).toBeCloseTo((-g * up) / 2 - (g * u) / 2)
			}
		})

		test('matrix', () => {
			const opt = new SantaSSSOptimizer(0.1, 0.95, 5)
			opt._z = () => 0.02
			const manager = opt.manager()
			const sigma = 0.95
			const c = 5
			const n = 16
			const lambda = 0.01
			const burnin = 5
			const lr = 0.1

			const v = Matrix.zeros(10, 3)
			const g = Matrix.zeros(10, 3)
			const a = new Matrix(10, 3, Math.sqrt(lr) * c)
			const u = new Matrix(10, 3, Math.sqrt(lr) * 0.02)
			for (let t = 0; t < 10; t++) {
				const mat = Matrix.randn(10, 3)
				mat.div((t + 10) ** 2)
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([10, 3])
				v.map((v, i) => v * sigma + ((1 - sigma) / n ** 2) * mat.at(i) ** 2)
				const gp = g.copy()
				const up = u.copy()
				g.map((_, i) => 1 / Math.sqrt(lambda + Math.sqrt(v.at(i))))
				if (t < burnin - 1) {
					const beta = (t + 1) ** 0.5
					a.map((v, i) => v + (u.at(i) ** 2 - lr / beta) / 2)
					u.map((v, i) => Math.exp(-a.at(i) / 2) * v)
					u.map(
						(v, i) =>
							v -
							g.at(i) * mat.at(i) * lr +
							((lr / beta) * (1 - gp.at(i) / g.at(i))) / up.at(i) +
							Math.sqrt(((2 * lr) / beta) * gp.at(i)) * 0.02
					)
					u.map((v, i) => Math.exp(-a.at(i) / 2) * v)
					a.map((v, i) => v + (u.at(i) ** 2 - lr / beta) / 2)
				} else {
					u.map((v, i) => Math.exp(-a.at(i) / 2) * v)
					u.map((v, i) => v - g.at(i) * mat.at(i) * lr)
					u.map((v, i) => Math.exp(-a.at(i) / 2) * v)
				}
				for (let i = 0; i < mat.rows; i++) {
					for (let j = 0; j < mat.cols; j++) {
						expect(d.at(i, j)).toBeCloseTo((-g.at(i, j) * u.at(i, j)) / 2 - (g.at(i, j) * up.at(i, j)) / 2)
					}
				}
			}
		})

		test('tensor', () => {
			const opt = new SantaSSSOptimizer(0.1, 0.95, 5)
			opt._z = () => 0.02
			const manager = opt.manager()
			const sigma = 0.95
			const c = 5
			const n = 16
			const lambda = 0.01
			const burnin = 5
			const lr = 0.1

			const v = Tensor.zeros([7, 5, 3])
			const g = Tensor.zeros([7, 5, 3])
			const a = new Tensor([7, 5, 3], Math.sqrt(lr) * c)
			const u = new Tensor([7, 5, 3], Math.sqrt(lr) * 0.02)
			for (let t = 0; t < 10; t++) {
				const mat = Tensor.randn([7, 5, 3])
				mat.map(v => v / (t + 10) ** 2)
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([7, 5, 3])
				v.map((v, i) => v * sigma + ((1 - sigma) / n ** 2) * mat.at(i) ** 2)
				const gp = g.copy()
				const up = u.copy()
				g.map((_, i) => 1 / Math.sqrt(lambda + Math.sqrt(v.at(i))))
				if (t < burnin - 1) {
					const beta = (t + 1) ** 0.5
					a.map((v, i) => v + (u.at(i) ** 2 - lr / beta) / 2)
					u.map((v, i) => Math.exp(-a.at(i) / 2) * v)
					u.map(
						(v, i) =>
							v -
							g.at(i) * mat.at(i) * lr +
							((lr / beta) * (1 - gp.at(i) / g.at(i))) / up.at(i) +
							Math.sqrt(((2 * lr) / beta) * gp.at(i)) * 0.02
					)
					u.map((v, i) => Math.exp(-a.at(i) / 2) * v)
					a.map((v, i) => v + (u.at(i) ** 2 - lr / beta) / 2)
				} else {
					u.map((v, i) => Math.exp(-a.at(i) / 2) * v)
					u.map((v, i) => v - g.at(i) * mat.at(i) * lr)
					u.map((v, i) => Math.exp(-a.at(i) / 2) * v)
				}
				for (let i = 0; i < mat.sizes[0]; i++) {
					for (let j = 0; j < mat.sizes[1]; j++) {
						for (let k = 0; k < mat.sizes[2]; k++) {
							expect(d.at(i, j, k)).toBeCloseTo(
								(-g.at(i, j, k) * u.at(i, j, k)) / 2 - (g.at(i, j, k) * up.at(i, j, k)) / 2
							)
						}
					}
				}
			}
		})
	})
})

test('nn', { retry: 10 }, () => {
	const net = NeuralNetwork.fromObject(
		[
			{ type: 'input', name: 'in' },
			{ type: 'full', out_size: 5, activation: 'tanh' },
			{ type: 'full', out_size: 3 },
		],
		'mse',
		'santasss'
	)
	const x = Matrix.randn(1, 10)
	const t = Matrix.randn(1, 3)

	const losslog = []
	for (let i = 0; i < 1000; i++) {
		const loss = net.fit(x, t, 1000, 0.001)
		losslog.push(loss[0])
		if (loss[0] < 1.0e-7) {
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
