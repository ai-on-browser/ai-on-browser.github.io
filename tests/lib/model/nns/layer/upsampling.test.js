import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import UpSamplingLayer from '../../../../../lib/model/nns/layer/upsampling.js'

describe('layer', () => {
	describe('construct', () => {
		test('default', () => {
			const layer = new UpSamplingLayer({ size: 2 })
			expect(layer).toBeDefined()
		})

		test('invalid channel', () => {
			expect(() => new UpSamplingLayer({ size: 2, channel_dim: 2 })).toThrow('Invalid channel dimension')
		})
	})

	describe('calc', () => {
		test.each([[2, 2], 2])('size:%j', size => {
			const layer = new UpSamplingLayer({ size })

			const x = Tensor.randn([10, 2, 2, 3])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 4, 4, 3])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < 2; j++) {
					for (let k = 0; k < 2; k++) {
						for (let c = 0; c < x.sizes[3]; c++) {
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									expect(y.at(i, j * 2 + s, k * 2 + t, c)).toEqual(x.at(i, j, k, c))
								}
							}
						}
					}
				}
			}
		})

		test('kernel:[2, 2] channel dim: 1', () => {
			const layer = new UpSamplingLayer({ size: [2, 2], channel_dim: 1 })

			const x = Tensor.randn([10, 3, 2, 2])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 3, 4, 4])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < 2; j++) {
					for (let k = 0; k < 2; k++) {
						for (let c = 0; c < x.sizes[1]; c++) {
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									expect(y.at(i, c, j * 2 + s, k * 2 + t)).toEqual(x.at(i, c, j, k))
								}
							}
						}
					}
				}
			}
		})

		test('size:[1, 2]', () => {
			const layer = new UpSamplingLayer({ size: [1, 2] })

			const x = Tensor.randn([10, 2, 2, 3])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 2, 4, 3])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < 2; j++) {
					for (let k = 0; k < 2; k++) {
						for (let c = 0; c < x.sizes[3]; c++) {
							for (let t = 0; t < 2; t++) {
								expect(y.at(i, j, k * 2 + t, c)).toEqual(x.at(i, j, k, c))
							}
						}
					}
				}
			}
		})

		test('invalid kernel size', () => {
			const layer = new UpSamplingLayer({ size: [2] })

			const x = Tensor.randn([1, 3, 3, 2])
			expect(() => layer.calc(x)).toThrow('Invalid size')
		})
	})

	describe('grad', () => {
		test('channel dim: -1', () => {
			const layer = new UpSamplingLayer({ size: [2, 2] })

			const x = Tensor.randn([10, 2, 2, 3])
			layer.calc(x)

			const bo = Tensor.randn([10, 4, 4, 3])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 2, 2, 3])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < 2; j++) {
					for (let k = 0; k < 2; k++) {
						for (let c = 0; c < x.sizes[3]; c++) {
							let sum = 0
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									sum += bo.at(i, j * 2 + s, k * 2 + t, c)
								}
							}
							expect(bi.at(i, j, k, c)).toBeCloseTo(sum)
						}
					}
				}
			}
		})

		test('channel dim: 1', () => {
			const layer = new UpSamplingLayer({ size: [2, 2], channel_dim: 1 })

			const x = Tensor.randn([10, 3, 2, 2])
			layer.calc(x)

			const bo = Tensor.randn([10, 3, 4, 4])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 3, 2, 2])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < 2; j++) {
					for (let k = 0; k < 2; k++) {
						for (let c = 0; c < x.sizes[1]; c++) {
							let sum = 0
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									sum += bo.at(i, c, j * 2 + s, k * 2 + t)
								}
							}
							expect(bi.at(i, c, j, k)).toBeCloseTo(sum)
						}
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new UpSamplingLayer({ size: [2, 2] })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'up_sampling', size: [2, 2], channel_dim: -1 })
	})

	test('fromObject', () => {
		const orglayer = new UpSamplingLayer({ size: [2, 2] })
		const layer = UpSamplingLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(UpSamplingLayer)
	})
})

describe('nn', () => {
	test('update', { retry: 3 }, () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{
					type: 'conv',
					kernel: 2,
					padding: [
						[0, 1],
						[0, 1],
					],
					channel: 1,
				},
				{ type: 'up_sampling', size: [2, 2] },
				{ type: 'flatten' },
			],
			'mse',
			'adam'
		)
		const baseSize = 2
		const x = Tensor.randn([1, baseSize, baseSize, 1]).toArray()
		const tmp = Matrix.randn(baseSize, baseSize)
		const t = new Matrix(1, (baseSize * 2) ** 2)
		for (let i = 0; i < baseSize; i++) {
			for (let j = 0; j < baseSize; j++) {
				for (let k = 0; k < 2; k++) {
					for (let l = 0; l < 2; l++) {
						t.set(0, (i * 2 + k) * 4 + j * 2 + l, tmp.at(i, j))
					}
				}
			}
		}

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
