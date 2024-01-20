import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import MaxPoolLayer from '../../../../../lib/model/nns/layer/maxpool.js'

describe('layer', () => {
	describe('construct', () => {
		test('default', () => {
			const layer = new MaxPoolLayer({ kernel: 2 })
			expect(layer).toBeDefined()
		})

		test('invalid channel', () => {
			expect(() => new MaxPoolLayer({ kernel: 2, channel_dim: 2 })).toThrow('Invalid channel dimension')
		})
	})

	describe('calc', () => {
		test('kernel:[2, 2]', () => {
			const layer = new MaxPoolLayer({ kernel: [2, 2] })

			const x = Tensor.randn([10, 4, 4, 3])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 2, 2, 3])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < 2; j++) {
					for (let k = 0; k < 2; k++) {
						for (let c = 0; c < x.sizes[3]; c++) {
							let maxval = -Infinity
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									const v = x.at(i, j * 2 + s, k * 2 + t, c)
									if (maxval < v) {
										maxval = v
									}
								}
							}
							expect(y.at(i, j, k, c)).toEqual(maxval)
						}
					}
				}
			}
		})

		test('kernel:[2, 2] channel dim: 1', () => {
			const layer = new MaxPoolLayer({ kernel: [2, 2], channel_dim: 1 })

			const x = Tensor.randn([10, 3, 4, 4])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 3, 2, 2])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < 2; j++) {
					for (let k = 0; k < 2; k++) {
						for (let c = 0; c < x.sizes[1]; c++) {
							let maxval = -Infinity
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									const v = x.at(i, c, j * 2 + s, k * 2 + t)
									if (maxval < v) {
										maxval = v
									}
								}
							}
							expect(y.at(i, c, j, k)).toEqual(maxval)
						}
					}
				}
			}
		})

		test('kernel:2 stride:1 padding:0', () => {
			const layer = new MaxPoolLayer({ kernel: 2, stride: 1 })

			const x = Tensor.randn([10, 3, 3, 1])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 2, 2, 1])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < y.sizes[1]; j++) {
					for (let k = 0; k < y.sizes[2]; k++) {
						for (let c = 0; c < y.sizes[3]; c++) {
							let v = -Infinity
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									v = Math.max(v, x.at(i, j + s, k + t, c))
								}
							}
							expect(y.at(i, j, k, c)).toBeCloseTo(v)
						}
					}
				}
			}
		})

		test('kernel:3 stride:1 padding:1', () => {
			const layer = new MaxPoolLayer({ kernel: 3, stride: 1, padding: 1 })

			const x = Tensor.randn([10, 3, 3, 2])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 3, 3, 2])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < y.sizes[1]; j++) {
					for (let k = 0; k < y.sizes[2]; k++) {
						for (let c = 0; c < y.sizes[3]; c++) {
							let v = -Infinity
							for (let s = 0; s < 3; s++) {
								for (let t = 0; t < 3; t++) {
									if (
										j + s - 1 < 0 ||
										j + s - 1 >= x.sizes[1] ||
										k + t - 1 < 0 ||
										k + t - 1 >= x.sizes[2]
									) {
										continue
									}
									v = Math.max(v, x.at(i, j + s - 1, k + t - 1, c))
								}
							}
							expect(y.at(i, j, k, c)).toBeCloseTo(v)
						}
					}
				}
			}
		})

		test('kernel:2 stride:2 padding:0', () => {
			const layer = new MaxPoolLayer({ kernel: 2, stride: 2, padding: 0 })

			const x = Tensor.randn([1, 3, 3, 2])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([1, 2, 2, 2])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < y.sizes[1]; j++) {
					for (let k = 0; k < y.sizes[2]; k++) {
						for (let c = 0; c < y.sizes[3]; c++) {
							let v = -Infinity
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									if (
										j * 2 + s < 0 ||
										j * 2 + s >= x.sizes[1] ||
										k * 2 + t < 0 ||
										k * 2 + t >= x.sizes[2]
									) {
										continue
									}
									v = Math.max(v, x.at(i, j * 2 + s, k * 2 + t, c))
								}
							}
							expect(y.at(i, j, k, c)).toBeCloseTo(v)
						}
					}
				}
			}
		})

		test('invalid kernel size', () => {
			const layer = new MaxPoolLayer({ kernel: [2] })

			const x = Tensor.randn([1, 3, 3, 2])
			expect(() => layer.calc(x)).toThrow('Invalid kernel size')
		})

		test('invalid stride size', () => {
			const layer = new MaxPoolLayer({ kernel: 2, stride: [1] })

			const x = Tensor.randn([1, 3, 3, 2])
			expect(() => layer.calc(x)).toThrow('Invalid stride size')
		})

		test('invalid padding size', () => {
			const layer = new MaxPoolLayer({ kernel: 2, padding: [1] })

			const x = Tensor.randn([1, 3, 3, 2])
			expect(() => layer.calc(x)).toThrow('Invalid padding size')
		})
	})

	describe('grad', () => {
		test('channel dim: -1', () => {
			const layer = new MaxPoolLayer({ kernel: [2, 2] })

			const x = Tensor.randn([10, 4, 4, 3])
			layer.calc(x)

			const bo = Tensor.randn([10, 2, 2, 3])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 4, 4, 3])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < 2; j++) {
					for (let k = 0; k < 2; k++) {
						for (let c = 0; c < x.sizes[3]; c++) {
							let maxval = -Infinity
							let maxidx = null
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									const v = x.at(i, j * 2 + s, k * 2 + t, c)
									if (maxval < v) {
										maxval = v
										maxidx = [j * 2 + s, k * 2 + t, c]
									}
								}
							}
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									expect(bi.at(i, j * 2 + s, k * 2 + t, c)).toEqual(
										maxidx[0] === j * 2 + s && maxidx[1] === k * 2 + t ? bo.at(i, j, k, c) : 0
									)
								}
							}
						}
					}
				}
			}
		})

		test('channel dim: 1', () => {
			const layer = new MaxPoolLayer({ kernel: [2, 2], channel_dim: 1 })

			const x = Tensor.randn([10, 3, 4, 4])
			layer.calc(x)

			const bo = Tensor.randn([10, 3, 2, 2])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 3, 4, 4])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < 2; j++) {
					for (let k = 0; k < 2; k++) {
						for (let c = 0; c < x.sizes[1]; c++) {
							let maxval = -Infinity
							let maxidx = null
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									const v = x.at(i, c, j * 2 + s, k * 2 + t)
									if (maxval < v) {
										maxval = v
										maxidx = [j * 2 + s, k * 2 + t, c]
									}
								}
							}
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									expect(bi.at(i, c, j * 2 + s, k * 2 + t)).toEqual(
										maxidx[0] === j * 2 + s && maxidx[1] === k * 2 + t ? bo.at(i, c, j, k) : 0
									)
								}
							}
						}
					}
				}
			}
		})

		test('kernel:2 stride:2 padding:0', () => {
			const layer = new MaxPoolLayer({ kernel: 2, stride: 2, padding: 0 })

			const x = Tensor.randn([10, 3, 3, 2])
			layer.calc(x)

			const bo = Tensor.randn([10, 2, 2, 2])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 3, 3, 2])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let c = 0; c < x.sizes[3]; c++) {
					for (let j = 0; j < 2; j++) {
						for (let k = 0; k < 2; k++) {
							let maxval = -Infinity
							let maxidx = null
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									if (j * 2 + s >= 3 || k * 2 + t >= 3) {
										continue
									}
									const v = x.at(i, j * 2 + s, k * 2 + t, c)
									if (maxval < v) {
										maxval = v
										maxidx = [j * 2 + s, k * 2 + t, c]
									}
								}
							}
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									if (j * 2 + s >= 3 || k * 2 + t >= 3) {
										continue
									}
									expect(bi.at(i, j * 2 + s, k * 2 + t, c)).toEqual(
										maxidx[0] === j * 2 + s && maxidx[1] === k * 2 + t ? bo.at(i, j, k, c) : 0
									)
								}
							}
						}
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new MaxPoolLayer({ kernel: [2, 2] })

		const obj = layer.toObject()
		expect(obj).toEqual({
			type: 'max_pool',
			kernel: [2, 2],
			padding: 0,
			stride: [2, 2],
			channel_dim: -1,
		})
	})

	test('fromObject', () => {
		const orglayer = new MaxPoolLayer({ kernel: [2, 2] })
		const layer = MaxPoolLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(MaxPoolLayer)
	})
})

describe('nn', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'conv', kernel: 3, padding: 1 },
				{ type: 'max_pool', kernel: [2, 2] },
				{ type: 'flatten' },
			],
			'mse',
			'adam'
		)
		const x = Tensor.randn([1, 4, 4, 1]).toArray()
		const t = Matrix.random(1, 8)

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
