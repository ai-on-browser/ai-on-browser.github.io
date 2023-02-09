import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import Layer from '../../../../../lib/model/nns/layer/base.js'

describe('layer', () => {
	test('construct', () => {
		const layer = Layer.fromObject({ type: 'bitwise_not' })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'bitwise_not' })

			const a = Matrix.randint(100, 10, 0, 255)

			const y = layer.calc(a)
			for (let i = 0; i < a.rows; i++) {
				for (let j = 0; j < a.cols; j++) {
					expect(y.at(i, j)).toBe(~a.at(i, j))
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'bitwise_not' })

			const a = Tensor.random([100, 20, 10], 0, 256)
			a.map(v => Math.floor(v))

			const y = layer.calc(a)
			for (let i = 0; i < a.sizes[0]; i++) {
				for (let j = 0; j < a.sizes[1]; j++) {
					for (let k = 0; k < a.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBe(~a.at(i, j, k))
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = Layer.fromObject({ type: 'bitwise_not' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'bitwise_not' })
	})

	test('fromObject', () => {
		const layer = Layer.fromObject({ type: 'bitwise_not' })
		expect(layer).toBeDefined()
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'bitwise_not' }])
		const a = Matrix.randint(100, 10, 0, 255)

		const y = net.calc(a)
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBe(~a.at(i, j))
			}
		}
	})
})
