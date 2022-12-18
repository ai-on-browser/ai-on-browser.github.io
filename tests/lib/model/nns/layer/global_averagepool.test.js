import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import GlobalAveragePoolLayer from '../../../../../lib/model/nns/layer/global_averagepool.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new GlobalAveragePoolLayer({})
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new GlobalAveragePoolLayer({})

		const x = Tensor.randn([10, 4, 4, 3])
		const y = layer.calc(x)
		expect(y.sizes).toEqual([10, 1, 1, 3])
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let c = 0; c < x.sizes[3]; c++) {
				let sumval = 0
				let count = 0
				for (let s = 0; s < x.sizes[1]; s++) {
					for (let t = 0; t < x.sizes[2]; t++) {
						sumval += x.at(i, s, t, c)
						count++
					}
				}
				expect(y.at(i, 0, 0, c)).toBeCloseTo(sumval / count)
			}
		}
	})

	test('grad', () => {
		const layer = new GlobalAveragePoolLayer({})

		const x = Tensor.randn([10, 4, 4, 3])
		layer.calc(x)

		const bo = Tensor.randn([10, 1, 1, 3])
		const bi = layer.grad(bo)
		expect(bi.sizes).toEqual([10, 4, 4, 3])
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let c = 0; c < x.sizes[3]; c++) {
				for (let j = 0; j < 4; j++) {
					for (let k = 0; k < 4; k++) {
						expect(bi.at(i, j, k, c)).toBeCloseTo(bo.at(i, 0, 0, c) / 16)
					}
				}
			}
		}
	})

	test('toObject', () => {
		const layer = new GlobalAveragePoolLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'global_average_pool', channel_dim: -1 })
	})

	test('fromObject', () => {
		const orglayer = new GlobalAveragePoolLayer({})
		const layer = GlobalAveragePoolLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(GlobalAveragePoolLayer)
	})
})

describe('nn', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'conv', kernel: 3, padding: 1 },
				{ type: 'global_average_pool' },
				{ type: 'flatten' },
			],
			'mse',
			'adam'
		)
		const x = Tensor.randn([1, 4, 4, 1]).toArray()
		const t = Matrix.random(1, 2)

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
