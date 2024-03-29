import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import PAULayer from '../../../../../lib/model/nns/layer/pau.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new PAULayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new PAULayer({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(0.1 * (1 + x.at(i, j) + x.at(i, j) ** 2))
				}
			}
		})

		test.each([
			[
				[0.1, 0.1, 0.1],
				[0, 0],
			],
			[
				[1, 2, 3],
				[4, 5],
			],
		])('matrix a:%p, b:%p', (a, b) => {
			const layer = new PAULayer({ a, b })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(
						(a[0] + a[1] * x.at(i, j) + a[2] * x.at(i, j) ** 2) /
							(1 + Math.abs(b[0] * x.at(i, j) + b[1] * x.at(i, j) ** 2))
					)
				}
			}
		})

		test('tensor', () => {
			const layer = new PAULayer({})

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(0.1 * (1 + x.at(i, j, k) + x.at(i, j, k) ** 2))
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new PAULayer({})

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(0.1 * (1 + 2 * x.at(i, j)))
				}
			}
		})

		test.each([
			[
				[0.1, 0.1, 0.1],
				[0, 0],
			],
			[
				[1, 2, 3],
				[4, 5],
			],
		])('matrix a:%p, b:%p', (a, b) => {
			const layer = new PAULayer({ a, b })

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					const p = a[0] + a[1] * x.at(i, j) + a[2] * x.at(i, j) ** 2
					const A = b[0] * x.at(i, j) + b[1] * x.at(i, j) ** 2
					const q = 1 + Math.abs(A)
					const dta = a[1] + a[2] * 2 * x.at(i, j)
					const dtb = b[0] + b[1] * 2 * x.at(i, j)
					expect(bi.at(i, j)).toBe(dta / q - Math.sign(A) * dtb * (p / q ** 2))
				}
			}
		})

		test('tensor', () => {
			const layer = new PAULayer({})

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(0.1 * (1 + 2 * x.at(i, j, k)))
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new PAULayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'pau', m: 2, n: 2, a: Array(3).fill(0.1), b: Array(2).fill(0) })
	})

	test('fromObject', () => {
		const layer = PAULayer.fromObject({ type: 'pau', n: 2, m: 2, a: 1, b: 1 })
		expect(layer).toBeInstanceOf(PAULayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'pau' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(0.1 * (1 + x.at(i, j) + x.at(i, j) ** 2))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'pau' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.randn(1, 3)

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
