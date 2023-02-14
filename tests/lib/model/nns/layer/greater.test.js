import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import GreaterLayer from '../../../../../lib/model/nns/layer/greater.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new GreaterLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new GreaterLayer({})

			const a = Matrix.randn(100, 10)
			const b = Matrix.randn(100, 10)

			const y = layer.calc(a, b)
			for (let i = 0; i < a.rows; i++) {
				for (let j = 0; j < a.cols; j++) {
					expect(y.at(i, j)).toBe(a.at(i, j) > b.at(i, j))
				}
			}
		})

		test('tensor', () => {
			const layer = new GreaterLayer({})

			const a = Tensor.randn([100, 20, 10])
			const b = Tensor.randn([100, 20, 10])

			const y = layer.calc(a, b)
			for (let i = 0; i < a.sizes[0]; i++) {
				for (let j = 0; j < a.sizes[1]; j++) {
					for (let k = 0; k < a.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBe(a.at(i, j, k) > b.at(i, j, k))
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new GreaterLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'greater' })
	})

	test('fromObject', () => {
		const layer = GreaterLayer.fromObject({ type: 'greater' })
		expect(layer).toBeInstanceOf(GreaterLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'greater', input: ['a', 'b'] },
		])
		const a = Matrix.randn(10, 10)
		const b = Matrix.randn(10, 10)

		const y = net.calc({ a, b })
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBe(a.at(i, j) > b.at(i, j))
			}
		}
	})
})
