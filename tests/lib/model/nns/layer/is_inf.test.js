import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Layer from '../../../../../lib/model/nns/layer/base.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = Layer.fromObject({ type: 'is_inf' })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'is_inf' })

			const a = new Matrix(1, 4, [0, Infinity, -Infinity, NaN])

			const y = layer.calc(a)
			expect(y.toArray()).toEqual([[false, true, true, false]])
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'is_inf' })

			const a = new Tensor([1, 1, 4], [0, Infinity, -Infinity, NaN])

			const y = layer.calc(a)
			expect(y.toArray()).toEqual([[[false, true, true, false]]])
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'is_inf' })

			const a = new Matrix(1, 4, [0, Infinity, -Infinity, NaN])

			layer.calc(a)

			const bo = Matrix.ones(4, 1)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([4, 1])
			for (let i = 0; i < 4; i++) {
				expect(bi.value[i]).toBe(0)
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'is_inf' })

			const a = new Tensor([1, 1, 4], [0, Infinity, -Infinity, NaN])

			layer.calc(a)

			const bo = Tensor.ones([1, 1, 4])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([1, 1, 4])
			for (let i = 0; i < 4; i++) {
				expect(bi.value[i]).toBe(0)
			}
		})
	})

	test('toObject', () => {
		const layer = Layer.fromObject({ type: 'is_inf' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'is_inf' })
	})

	test('fromObject', () => {
		const layer = Layer.fromObject({ type: 'is_inf' })
		expect(layer).toBeDefined()
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'is_inf' }])
		const a = new Matrix(1, 4, [0, Infinity, -Infinity, NaN])

		const y = net.calc(a)
		expect(y.toArray()).toEqual([[false, true, true, false]])
	})
})
