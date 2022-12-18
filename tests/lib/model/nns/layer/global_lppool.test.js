import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import GlobalLpPoolLayer from '../../../../../lib/model/nns/layer/global_lppool.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new GlobalLpPoolLayer({ p: 2 })
		expect(layer).toBeDefined()
	})

	test.each([1, 2])('calc', p => {
		const layer = new GlobalLpPoolLayer({ p })

		const x = Tensor.randn([10, 4, 4, 3])
		const y = layer.calc(x)
		expect(y.sizes).toEqual([10, 1, 1, 3])
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let c = 0; c < x.sizes[3]; c++) {
				let sumval = 0
				for (let s = 0; s < x.sizes[1]; s++) {
					for (let t = 0; t < x.sizes[2]; t++) {
						sumval += x.at(i, s, t, c) ** p
					}
				}
				expect(y.at(i, 0, 0, c)).toBeCloseTo(sumval ** (1 / p))
			}
		}
	})

	test.each([1, 2])('grad %d', p => {
		const layer = new GlobalLpPoolLayer({ p })

		const x = Tensor.randn([10, 4, 4, 3])
		const y = layer.calc(x)

		const bo = Tensor.randn([10, 1, 1, 3])
		const bi = layer.grad(bo)
		expect(bi.sizes).toEqual([10, 4, 4, 3])
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let c = 0; c < x.sizes[3]; c++) {
				for (let j = 0; j < 4; j++) {
					for (let k = 0; k < 4; k++) {
						expect(bi.at(i, j, k, c)).toBeCloseTo(
							bo.at(i, 0, 0, c) * (y.at(i, 0, 0, c) ** p) ** (1 / p - 1) * x.at(i, j, k, c) ** (p - 1)
						)
					}
				}
			}
		}
	})

	test('toObject', () => {
		const layer = new GlobalLpPoolLayer({ p: 2 })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'global_lp_pool', p: 2, channel_dim: -1 })
	})

	test('fromObject', () => {
		const orglayer = new GlobalLpPoolLayer({ p: 2 })
		const layer = GlobalLpPoolLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(GlobalLpPoolLayer)
	})
})

describe('nn', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'conv', kernel: 3, padding: 1 },
				{ type: 'global_lp_pool', p: 2 },
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
