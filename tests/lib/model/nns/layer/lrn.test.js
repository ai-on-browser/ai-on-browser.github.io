import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import LRNLayer from '../../../../../lib/model/nns/layer/lrn.js'

describe('layer', () => {
	describe('construct', () => {
		test('default', () => {
			const layer = new LRNLayer({ alpha: 0.0001, beta: 0.75, k: 1, n: 2 })
			expect(layer).toBeDefined()
		})

		test('invalid channel', () => {
			expect(() => new LRNLayer({ alpha: 0.0001, beta: 0.75, k: 1, n: 2, channel_dim: 2 })).toThrow(
				'Invalid channel dimension'
			)
		})
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new LRNLayer({ alpha: 0.0001, beta: 0.75, k: 1, n: 2 })

			const x = Matrix.randn(10, 3)
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 3])
			for (let i = 0; i < x.length; i++) {
				expect(y.value[i]).toBeCloseTo(x.value[i])
			}
		})

		test('tensor', () => {
			const layer = new LRNLayer({ alpha: 0.0001, beta: 0.75, k: 1, n: 2 })

			const x = Tensor.randn([100, 7, 7, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([100, 7, 7, 5])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						for (let c = 0; c < x.sizes[3]; c++) {
							let v = 0
							for (let cv = Math.max(0, c - 1); cv < Math.min(x.sizes[3], c + 2); cv++) {
								v += x.at(i, j, k, cv) ** 2
							}
							expect(y.at(i, j, k, c)).toBeCloseTo(x.at(i, j, k, c) / (1 + 0.0001 * v) ** 0.75)
						}
					}
				}
			}
		})

		test('tensor channel dim: 1', () => {
			const layer = new LRNLayer({ alpha: 0.0001, beta: 0.75, k: 1, n: 2, channel_dim: 1 })

			const x = Tensor.randn([100, 5, 7, 7])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([100, 5, 7, 7])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[2]; j++) {
					for (let k = 0; k < x.sizes[3]; k++) {
						for (let c = 0; c < x.sizes[1]; c++) {
							let v = 0
							for (let cv = Math.max(0, c - 1); cv < Math.min(x.sizes[1], c + 2); cv++) {
								v += x.at(i, cv, j, k) ** 2
							}
							expect(y.at(i, c, j, k)).toBeCloseTo(x.at(i, c, j, k) / (1 + 0.0001 * v) ** 0.75)
						}
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('channel dim: -1', () => {
			const layer = new LRNLayer({ alpha: 0.0001, beta: 0.75, k: 1, n: 2 })

			const x = Tensor.randn([10, 3, 3, 2])
			layer.calc(x)

			const bo = Tensor.randn([10, 3, 3, 2])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 3, 3, 2])
		})

		test('channel dim: 1', () => {
			const layer = new LRNLayer({ alpha: 0.0001, beta: 0.75, k: 1, n: 2, channel_dim: 1 })

			const x = Tensor.randn([10, 2, 3, 3])
			layer.calc(x)

			const bo = Tensor.randn([10, 2, 3, 3])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 2, 3, 3])
		})
	})

	test('toObject', () => {
		const layer = new LRNLayer({ alpha: 0.0001, beta: 0.75, k: 1, n: 2 })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'lrn', alpha: 0.0001, beta: 0.75, k: 1, n: 2, channel_dim: -1 })
	})

	test('fromObject', () => {
		const orglayer = new LRNLayer({ alpha: 0.0001, beta: 0.75, k: 1, n: 2 })
		orglayer.calc(Tensor.randn([10, 3, 3, 2]))
		const layer = LRNLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(LRNLayer)
	})
})

describe('nn', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 45 },
				{ type: 'reshape', size: [3, 3, 5] },
				{ type: 'lrn', alpha: 0.0001, beta: 0.75, k: 1, n: 2 },
				{ type: 'flatten' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 100).toArray()
		const t = Matrix.randn(1, 45)

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
