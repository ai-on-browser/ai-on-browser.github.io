import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import InputLayer from '../../../../../lib/model/nns/layer/input.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new InputLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('scalar', () => {
			const layer = new InputLayer({})

			const x = 1
			layer.bind({ input: x })
			const y = layer.calc()
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBe(1)
		})

		test('array 1d', () => {
			const layer = new InputLayer({})

			const x = Matrix.randn(1, 10).value
			layer.bind({ input: x })
			const y = layer.calc()
			for (let i = 0; i < x.length; i++) {
				expect(y.at(i)).toBeCloseTo(x[i])
			}
		})

		test('array 2d', () => {
			const layer = new InputLayer({})

			const x = Matrix.randn(10, 10).toArray()
			layer.bind({ input: x })
			const y = layer.calc()
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x[i][j])
				}
			}
		})

		test('matrix', () => {
			const layer = new InputLayer({})

			const x = Matrix.randn(10, 10)
			layer.bind({ input: x })
			const y = layer.calc()
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j))
				}
			}
		})

		test('tensor', () => {
			const layer = new InputLayer({})

			const x = Tensor.randn([20, 10, 10])
			layer.bind({ input: x })
			const y = layer.calc()
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(x.at(i, j, k))
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new InputLayer({})

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			expect(bi).toBeUndefined()
		})

		test('tensor', () => {
			const layer = new InputLayer({})

			const bo = Tensor.ones([100, 20, 10])
			const bi = layer.grad(bo)
			expect(bi).toBeUndefined()
		})
	})

	test('toObject', () => {
		const layer = new InputLayer({ name: 'in' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'input', name: 'in' })
	})

	test('fromObject', () => {
		const layer = InputLayer.fromObject({ type: 'input' })
		expect(layer).toBeInstanceOf(InputLayer)
	})
})

describe('nn', () => {
	test('one input', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j))
			}
		}
	})

	test('named input', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'concat', input: ['a', 'b'] },
		])
		const a = Matrix.randn(10, 10)
		const b = Matrix.randn(10, 10)

		const y = net.calc({ a, b })
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(a.at(i, j))
			}
			for (let j = 0; j < b.cols; j++) {
				expect(y.at(i, j + a.cols)).toBeCloseTo(b.at(i, j))
			}
		}
	})
})
