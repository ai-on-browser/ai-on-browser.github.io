import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Layer from '../../../../../lib/model/nns/layer/base.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = Layer.fromObject({ type: 'and' })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'and' })

			const a = new Matrix(4, 1, [false, false, true, true])
			const b = new Matrix(4, 1, [false, true, false, true])

			const y = layer.calc(a, b)
			expect(y.value).toEqual([false, false, false, true])
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'and' })

			const a = new Tensor([4, 1, 1], [false, false, true, true])
			const b = new Tensor([4, 1, 1], [false, true, false, true])

			const y = layer.calc(a, b)
			expect(y.value).toEqual([false, false, false, true])
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'and' })

			const a = new Matrix(4, 1, [false, false, true, true])
			const b = new Matrix(4, 1, [false, true, false, true])

			layer.calc(a, b)

			const bo = Matrix.ones(4, 1)
			const bi = layer.grad(bo)
			expect(bi).toHaveLength(2)
			expect(bi[0].sizes).toEqual([4, 1])
			expect(bi[1].sizes).toEqual([4, 1])
			for (let i = 0; i < 4; i++) {
				expect(bi[0].value[i]).toBe(0)
				expect(bi[1].value[i]).toBe(0)
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'and' })

			const a = new Tensor([4, 1, 1], [false, false, true, true])
			const b = new Tensor([4, 1, 1], [false, true, false, true])

			layer.calc(a, b)

			const bo = Tensor.ones([4, 1, 1])
			const bi = layer.grad(bo)
			expect(bi).toHaveLength(2)
			expect(bi[0].sizes).toEqual([4, 1, 1])
			expect(bi[1].sizes).toEqual([4, 1, 1])
			for (let i = 0; i < 4; i++) {
				expect(bi[0].value[i]).toBe(0)
				expect(bi[1].value[i]).toBe(0)
			}
		})
	})

	test('toObject', () => {
		const layer = Layer.fromObject({ type: 'and' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'and' })
	})

	test('fromObject', () => {
		const layer = Layer.fromObject({ type: 'and' })
		expect(layer).toBeDefined()
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
