import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import XorLayer from '../../../../../lib/model/nns/layer/xor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new XorLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new XorLayer({})

			const a = new Matrix(4, 1, [false, false, true, true])
			const b = new Matrix(4, 1, [false, true, false, true])

			const y = layer.calc(a, b)
			expect(y.value).toEqual([false, true, true, false])
		})

		test('tensor', () => {
			const layer = new XorLayer({})

			const a = new Tensor([4, 1, 1], [false, false, true, true])
			const b = new Tensor([4, 1, 1], [false, true, false, true])

			const y = layer.calc(a, b)
			expect(y.value).toEqual([false, true, true, false])
		})
	})

	test('toObject', () => {
		const layer = new XorLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'xor' })
	})

	test('fromObject', () => {
		const layer = XorLayer.fromObject({ type: 'xor' })
		expect(layer).toBeInstanceOf(XorLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'xor', input: ['a', 'b'] },
		])
		const a = new Matrix(4, 1, [false, false, true, true])
		const b = new Matrix(4, 1, [false, true, false, true])

		const y = net.calc({ a, b })
		expect(y.value).toEqual([false, true, true, false])
	})
})
