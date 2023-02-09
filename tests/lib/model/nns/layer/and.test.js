import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import AndLayer from '../../../../../lib/model/nns/layer/and.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new AndLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new AndLayer({})

			const a = new Matrix(4, 1, [false, false, true, true])
			const b = new Matrix(4, 1, [false, true, false, true])

			const y = layer.calc(a, b)
			expect(y.value).toEqual([false, false, false, true])
		})

		test('tensor', () => {
			const layer = new AndLayer({})

			const a = new Tensor([4, 1, 1], [false, false, true, true])
			const b = new Tensor([4, 1, 1], [false, true, false, true])

			const y = layer.calc(a, b)
			expect(y.value).toEqual([false, false, false, true])
		})
	})

	test('toObject', () => {
		const layer = new AndLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'and' })
	})

	test('fromObject', () => {
		const layer = AndLayer.fromObject({ type: 'and' })
		expect(layer).toBeInstanceOf(AndLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'and', input: ['a', 'b'] },
		])
		const a = new Matrix(4, 1, [false, false, true, true])
		const b = new Matrix(4, 1, [false, true, false, true])

		const y = net.calc({ a, b })
		expect(y.value).toEqual([false, false, false, true])
	})
})
