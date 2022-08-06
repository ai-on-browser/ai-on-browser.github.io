import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import LessLayer from '../../../../../lib/model/nns/layer/less.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new LessLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new LessLayer({})

			const a = Matrix.randn(100, 10)
			const b = Matrix.randn(100, 10)

			const y = layer.calc(a, b)
			for (let i = 0; i < a.rows; i++) {
				for (let j = 0; j < a.cols; j++) {
					expect(y.at(i, j)).toBe(a.at(i, j) < b.at(i, j))
				}
			}
		})

		test('tensor', () => {
			const layer = new LessLayer({})

			const a = Tensor.randn([100, 20, 10])
			const b = Tensor.randn([100, 20, 10])

			const y = layer.calc(a, b)
			for (let i = 0; i < a.sizes[0]; i++) {
				for (let j = 0; j < a.sizes[1]; j++) {
					for (let k = 0; k < a.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBe(a.at(i, j, k) < b.at(i, j, k))
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new LessLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'less' })
	})

	test('fromObject', () => {
		const layer = LessLayer.fromObject({ type: 'less' })
		expect(layer).toBeInstanceOf(LessLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'less', input: ['a', 'b'] },
		])
		const a = Matrix.randn(10, 10)
		const b = Matrix.randn(10, 10)

		const y = net.calc({ a, b })
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBe(a.at(i, j) < b.at(i, j))
			}
		}
	})
})
