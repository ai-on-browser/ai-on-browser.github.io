import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import FlattenLayer from '../../../../../lib/model/nns/layer/flatten.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new FlattenLayer({})
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new FlattenLayer({})

		const x = Tensor.randn([100, 10, 3])
		const y = layer.calc(x)
		expect(y.sizes).toEqual([100, 30])
		for (let i = 0; i < x.length; i++) {
			expect(y.value[i]).toBe(x.value[i])
		}
	})

	test('grad', () => {
		const layer = new FlattenLayer({})

		const x = Tensor.randn([100, 10, 3])
		layer.calc(x)

		const bo = Matrix.ones(100, 30)
		const bi = layer.grad(bo)
		expect(bi.sizes).toEqual([100, 10, 3])
		for (let i = 0; i < x.length; i++) {
			expect(bi.value[i]).toBe(1)
		}
	})

	test('toObject', () => {
		const layer = new FlattenLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'flatten' })
	})
})

describe('nn', () => {
	test('calc mat', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'flatten' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([10, 10])
		for (let i = 0; i < x.length; i++) {
			expect(y.value[i]).toBeCloseTo(x.value[i])
		}
	})

	test('calc ten', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'flatten' }])
		const x = Tensor.randn([10, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([10, 100])
		for (let i = 0; i < x.length; i++) {
			expect(y.value[i]).toBeCloseTo(x.value[i])
		}
	})

	test('grad mat', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'flatten' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.randn(1, 3)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('grad ten', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'conv', kernel: 3 }, { type: 'flatten' }],
			'mse',
			'adam'
		)
		const x = Tensor.randn([1, 4, 4, 3])
		const t = Matrix.randn(1, 24)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})
