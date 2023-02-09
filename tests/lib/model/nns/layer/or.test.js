import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import OrLayer from '../../../../../lib/model/nns/layer/or.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new OrLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new OrLayer({})

			const a = new Matrix(4, 1, [false, false, true, true])
			const b = new Matrix(4, 1, [false, true, false, true])

			const y = layer.calc(a, b)
			expect(y.value).toEqual([false, true, true, true])
		})

		test('tensor', () => {
			const layer = new OrLayer({})

			const a = new Tensor([4, 1, 1], [false, false, true, true])
			const b = new Tensor([4, 1, 1], [false, true, false, true])

			const y = layer.calc(a, b)
			expect(y.value).toEqual([false, true, true, true])
		})
	})

	test('toObject', () => {
		const layer = new OrLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'or' })
	})

	test('fromObject', () => {
		const layer = OrLayer.fromObject({ type: 'or' })
		expect(layer).toBeInstanceOf(OrLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'or', input: ['a', 'b'] },
		])
		const a = new Matrix(4, 1, [false, false, true, true])
		const b = new Matrix(4, 1, [false, true, false, true])

		const y = net.calc({ a, b })
		expect(y.value).toEqual([false, true, true, true])
	})
})
