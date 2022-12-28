import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import MatmulLayer from '../../../../../lib/model/nns/layer/matmul.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new MatmulLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('calc', () => {
			const layer = new MatmulLayer({})

			const x1 = Matrix.randn(100, 10)
			const x2 = Matrix.randn(10, 7)
			const y = layer.calc(x1, x2)
			expect(y.sizes).toEqual([100, 7])
			for (let i = 0; i < x1.rows; i++) {
				for (let j = 0; j < x2.cols; j++) {
					let v = 0
					for (let k = 0; k < x1.cols; k++) {
						v += x1.at(i, k) * x2.at(k, j)
					}
					expect(y.at(i, j)).toBeCloseTo(v)
				}
			}
		})

		test('tensor', () => {
			const layer = new MatmulLayer({})

			const x1 = Tensor.randn([2, 3, 4])
			const x2 = Tensor.randn([2, 3, 4])
			expect(() => layer.calc(x1, x2)).toThrow()
		})
	})

	test('grad', () => {
		const layer = new MatmulLayer({})

		const x1 = Matrix.randn(100, 10)
		const x2 = Matrix.randn(10, 7)
		layer.calc(x1, x2)

		const bo = Matrix.ones(100, 7)
		const bi = layer.grad(bo)
		expect(bi).toHaveLength(2)

		const ebi0 = bo.dot(x2.t)
		const ebi1 = x1.tDot(bo)
		for (let i = 0; i < x1.rows; i++) {
			for (let j = 0; j < x1.cols; j++) {
				expect(bi[0].at(i, j)).toBeCloseTo(ebi0.at(i, j))
			}
		}
		for (let i = 0; i < x2.rows; i++) {
			for (let j = 0; j < x2.cols; j++) {
				expect(bi[1].at(i, j)).toBeCloseTo(ebi1.at(i, j))
			}
		}
	})

	test('toObject', () => {
		const layer = new MatmulLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'matmul' })
	})

	test('fromObject', () => {
		const layer = MatmulLayer.fromObject({ type: 'matmul' })
		expect(layer).toBeInstanceOf(MatmulLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'input', name: 'c' },
			{ type: 'matmul', input: ['a', 'b', 'c'] },
		])
		const a = Matrix.randn(10, 7)
		const b = Matrix.randn(7, 5)
		const c = Matrix.randn(5, 3)

		const y = net.calc({ a, b, c })
		const d = a.dot(b).dot(c)
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < c.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(d.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 4, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 3, name: 'bo' },
				{ type: 'input', name: 'c' },
				{ type: 'full', out_size: 2, name: 'co' },
				{ type: 'matmul', input: ['ao', 'bo', 'co'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(4, 5, -0.1, 0.1)
		const c = Matrix.random(3, 5, -0.1, 0.1)
		const t = Matrix.random(1, 2, -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ a, b, c }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b, c })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})
