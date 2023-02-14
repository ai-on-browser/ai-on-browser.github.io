import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import BitwiseXorLayer from '../../../../../lib/model/nns/layer/bitwise_xor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new BitwiseXorLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new BitwiseXorLayer({})

			const a = Matrix.randint(100, 10, 0, 255)
			const b = Matrix.randint(100, 10, 0, 255)

			const y = layer.calc(a, b)
			for (let i = 0; i < a.rows; i++) {
				for (let j = 0; j < a.cols; j++) {
					expect(y.at(i, j)).toBe(a.at(i, j) ^ b.at(i, j))
				}
			}
		})

		test('tensor', () => {
			const layer = new BitwiseXorLayer({})

			const a = Tensor.random([100, 20, 10], 0, 256)
			a.map(v => Math.floor(v))
			const b = Tensor.random([100, 20, 10], 0, 256)
			b.map(v => Math.floor(v))

			const y = layer.calc(a, b)
			for (let i = 0; i < a.sizes[0]; i++) {
				for (let j = 0; j < a.sizes[1]; j++) {
					for (let k = 0; k < a.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBe(a.at(i, j, k) ^ b.at(i, j, k))
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new BitwiseXorLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'bitwise_xor' })
	})

	test('fromObject', () => {
		const layer = BitwiseXorLayer.fromObject({ type: 'bitwise_xor' })
		expect(layer).toBeInstanceOf(BitwiseXorLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'bitwise_xor', input: ['a', 'b'] },
		])
		const a = Matrix.randint(100, 10, 0, 255)
		const b = Matrix.randint(100, 10, 0, 255)

		const y = net.calc({ a, b })
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBe(a.at(i, j) ^ b.at(i, j))
			}
		}
	})
})
