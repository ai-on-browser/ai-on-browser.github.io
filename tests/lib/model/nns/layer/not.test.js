import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import Layer from '../../../../../lib/model/nns/layer/base.js'

describe('layer', () => {
	test('construct', () => {
		const layer = Layer.fromObject({ type: 'not' })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'not' })

			const a = Matrix.randint(100, 10, 0, 1)

			const y = layer.calc(a)
			for (let i = 0; i < a.rows; i++) {
				for (let j = 0; j < a.cols; j++) {
					expect(y.at(i, j)).toBe(!a.at(i, j))
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'not' })

			const a = Tensor.random([15, 10, 7], 0, 2)
			a.map(v => Math.floor(v))

			const y = layer.calc(a)
			for (let i = 0; i < a.sizes[0]; i++) {
				for (let j = 0; j < a.sizes[1]; j++) {
					for (let k = 0; k < a.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBe(!a.at(i, j, k))
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'not' })

			const a = Matrix.randint(100, 10, 0, 1)

			layer.calc(a)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < a.rows; i++) {
				for (let j = 0; j < a.cols; j++) {
					expect(bi.at(i, j)).toBe(0)
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'not' })

			const a = Tensor.random([15, 10, 7], 0, 2)
			a.map(v => Math.floor(v))

			layer.calc(a)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < a.sizes[0]; i++) {
				for (let j = 0; j < a.sizes[1]; j++) {
					for (let k = 0; k < a.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBe(0)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = Layer.fromObject({ type: 'not' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'not' })
	})

	test('fromObject', () => {
		const layer = Layer.fromObject({ type: 'not' })
		expect(layer).toBeDefined()
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'not' }])
		const a = Matrix.randint(100, 10, 0, 1)

		const y = net.calc(a)
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBe(!a.at(i, j))
			}
		}
	})
})
