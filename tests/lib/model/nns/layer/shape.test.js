import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import ShapeLayer from '../../../../../lib/model/nns/layer/shape.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new ShapeLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new ShapeLayer({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			expect(y.toArray()).toEqual([100, 10])
		})

		test('tensor', () => {
			const layer = new ShapeLayer({})

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			expect(y.toArray()).toEqual([15, 10, 7])
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new ShapeLayer({})

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Tensor.ones([2])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(0)
				}
			}
		})

		test('tensor', () => {
			const layer = new ShapeLayer({})

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([3])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(0)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new ShapeLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'shape' })
	})

	test('fromObject', () => {
		const layer = ShapeLayer.fromObject({ type: 'shape' })
		expect(layer).toBeInstanceOf(ShapeLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'shape' }])
		const x = Matrix.randn(100, 10)

		const y = net.calc(x)
		expect(y.value).toEqual([100, 10])
	})
})
