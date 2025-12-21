import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import { SMORMS3Optimizer } from '../../../../../lib/model/nns/optimizer/smorms3.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('SMORMS3', () => {
	test('lr', () => {
		const opt = new SMORMS3Optimizer(0.1)
		const manager = opt.manager()
		expect(manager.lr).toBe(0.1)
	})

	describe('delta', () => {
		test('scalar', () => {
			const opt = new SMORMS3Optimizer(0.1)
			const manager = opt.manager()

			let s = 1
			let g = 0
			let gg = 0
			for (let i = 0; i < 10; i++) {
				const v = Math.random()
				const d = manager.delta('w', v)
				expect(typeof d).toBe('number')
				const r = 1 / (s + 1)
				g = g * (1 - r) + v * r
				gg = gg * (1 - r) + v ** 2 * r
				const z = g ** 2 / gg
				s = 1 + s * (1 - z)
				expect(d).toBeCloseTo((v * Math.min(0.1, z)) / Math.sqrt(gg))
			}
		})

		test('matrix', () => {
			const opt = new SMORMS3Optimizer(0.1)
			const manager = opt.manager()

			const s = Matrix.ones(10, 3)
			const g = Matrix.zeros(10, 3)
			const gg = Matrix.zeros(10, 3)
			for (let t = 0; t < 10; t++) {
				const mat = Matrix.randn(10, 3)
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([10, 3])
				const r = Matrix.map(s, v => 1 / (v + 1))
				g.map((v, i) => v * (1 - r.at(i)) + mat.at(i) * r.at(i))
				gg.map((v, i) => v * (1 - r.at(i)) + mat.at(i) ** 2 * r.at(i))
				const z = Matrix.div(Matrix.mult(g, g), gg)
				s.broadcastOperate(z, (a, b) => 1 + a * (1 - b))
				for (let i = 0; i < mat.rows; i++) {
					for (let j = 0; j < mat.cols; j++) {
						expect(d.at(i, j)).toBeCloseTo(
							(mat.at(i, j) * Math.min(0.1, z.at(i, j))) / Math.sqrt(gg.at(i, j))
						)
					}
				}
			}
		})

		test('tensor', () => {
			const opt = new SMORMS3Optimizer(0.1)
			const manager = opt.manager()

			const s = Tensor.ones([7, 5, 3])
			const g = Tensor.zeros([7, 5, 3])
			const gg = Tensor.zeros([7, 5, 3])
			for (let t = 0; t < 10; t++) {
				const mat = Tensor.randn([7, 5, 3])
				const d = manager.delta('w', mat)
				expect(d.sizes).toEqual([7, 5, 3])
				const r = s.copy()
				r.map(v => 1 / (v + 1))
				g.map((v, i) => v * (1 - r.at(i)) + mat.at(i) * r.at(i))
				gg.map((v, i) => v * (1 - r.at(i)) + mat.at(i) ** 2 * r.at(i))
				const z = g.copy()
				z.map((v, i) => v ** 2 / gg.at(i))
				s.broadcastOperate(z, (a, b) => 1 + a * (1 - b))
				for (let i = 0; i < mat.sizes[0]; i++) {
					for (let j = 0; j < mat.sizes[1]; j++) {
						for (let k = 0; k < mat.sizes[2]; k++) {
							expect(d.at(i, j, k)).toBeCloseTo(
								(mat.at(i, j, k) * Math.min(0.1, z.at(i, j, k))) / Math.sqrt(gg.at(i, j, k))
							)
						}
					}
				}
			}
		})
	})
})

test('nn', { retry: 3 }, () => {
	const net = NeuralNetwork.fromObject(
		[
			{ type: 'input', name: 'in' },
			{ type: 'full', out_size: 5, activation: 'sigmoid' },
			{ type: 'full', out_size: 3 },
		],
		'mse',
		'smorms3'
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
