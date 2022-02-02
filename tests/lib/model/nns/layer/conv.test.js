import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import ConvLayer from '../../../../../lib/model/nns/layer/conv.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new ConvLayer({ kernel: 3 })
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new ConvLayer({ kernel: 3, padding: 1 })

		const x = Tensor.randn([10, 3, 3, 2])
		const y = layer.calc(x)
		expect(y.sizes).toEqual([10, 3, 3, 4])
	})

	test('grad', () => {
		const layer = new ConvLayer({ kernel: 3, padding: 1 })

		const x = Tensor.randn([10, 3, 3, 2])
		layer.calc(x)

		const bo = Tensor.randn([10, 3, 3, 4])
		const bi = layer.grad(bo)
		expect(bi.sizes).toEqual([10, 3, 3, 2])
	})

	test('toObject', () => {
		const layer = new ConvLayer({ kernel: 3, padding: 1 })

		const obj = layer.toObject()
		expect(obj).toEqual({
			type: 'conv',
			kernel: 3,
			padding: 1,
			activation: null,
			channel: null,
			l1_decay: 0,
			l2_decay: 0,
			stride: 1,
		})
	})
})

describe('nn', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'conv', kernel: 3, padding: 1 }, { type: 'flatten' }],
			'mse',
			'adam'
		)
		const x = Tensor.randn([1, 3, 3, 2]).toArray()
		const t = Matrix.randn(1, 36)

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
