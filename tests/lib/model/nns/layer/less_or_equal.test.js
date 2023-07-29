import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import Layer from '../../../../../lib/model/nns/layer/base.js'

describe('layer', () => {
	test('construct', () => {
		const layer = Layer.fromObject({ type: 'less_or_equal' })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'less_or_equal' })

			const a = Matrix.randint(100, 10, -5, 5)
			const b = Matrix.randint(100, 10, -5, 5)

			const y = layer.calc(a, b)
			for (let i = 0; i < a.rows; i++) {
				for (let j = 0; j < a.cols; j++) {
					expect(y.at(i, j)).toBe(a.at(i, j) <= b.at(i, j))
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'less_or_equal' })

			const a = Tensor.random([15, 10, 7], -5, 5)
			a.map(v => Math.floor(v))
			const b = Tensor.random([15, 10, 7], -5, 5)
			b.map(v => Math.floor(v))

			const y = layer.calc(a, b)
			for (let i = 0; i < a.sizes[0]; i++) {
				for (let j = 0; j < a.sizes[1]; j++) {
					for (let k = 0; k < a.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBe(a.at(i, j, k) <= b.at(i, j, k))
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'less_or_equal' })

			const a = Matrix.randint(100, 10, -5, 5)
			const b = Matrix.randint(100, 10, -5, 5)

			layer.calc(a, b)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			expect(bi).toHaveLength(2)
			expect(bi[0].sizes).toEqual([100, 10])
			expect(bi[1].sizes).toEqual([100, 10])
			for (let i = 0; i < 1000; i++) {
				expect(bi[0].value[i]).toBe(0)
				expect(bi[1].value[i]).toBe(0)
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'less_or_equal' })

			const a = Tensor.random([15, 10, 7], -5, 5)
			a.map(v => Math.floor(v))
			const b = Tensor.random([15, 10, 7], -5, 5)
			b.map(v => Math.floor(v))

			layer.calc(a, b)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			expect(bi).toHaveLength(2)
			expect(bi[0].sizes).toEqual([15, 10, 7])
			expect(bi[1].sizes).toEqual([15, 10, 7])
			for (let i = 0; i < 1050; i++) {
				expect(bi[0].value[i]).toBe(0)
				expect(bi[1].value[i]).toBe(0)
			}
		})
	})

	test('toObject', () => {
		const layer = Layer.fromObject({ type: 'less_or_equal' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'less_or_equal' })
	})

	test('fromObject', () => {
		const layer = Layer.fromObject({ type: 'less_or_equal' })
		expect(layer).toBeDefined()
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'less_or_equal', input: ['a', 'b'] },
		])
		const a = Matrix.randint(100, 10, -5, 5)
		const b = Matrix.randint(100, 10, -5, 5)

		const y = net.calc({ a, b })
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBe(a.at(i, j) <= b.at(i, j))
			}
		}
	})
})
