import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import Layer from '../../../../../lib/model/nns/layer/base.js'

describe('layer', () => {
	test('construct', () => {
		const layer = Layer.fromObject({ type: 'is_nan' })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'is_nan' })

			const a = new Matrix(1, 4, [0, Infinity, -Infinity, NaN])

			const y = layer.calc(a)
			expect(y.toArray()).toEqual([[false, false, false, true]])
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'is_nan' })

			const a = new Tensor([1, 1, 4], [0, Infinity, -Infinity, NaN])

			const y = layer.calc(a)
			expect(y.toArray()).toEqual([[[false, false, false, true]]])
		})
	})

	test('toObject', () => {
		const layer = Layer.fromObject({ type: 'is_nan' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'is_nan' })
	})

	test('fromObject', () => {
		const layer = Layer.fromObject({ type: 'is_nan' })
		expect(layer).toBeDefined()
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'is_nan' }])
		const a = new Matrix(1, 4, [0, Infinity, -Infinity, NaN])

		const y = net.calc(a)
		expect(y.toArray()).toEqual([[false, false, false, true]])
	})
})
