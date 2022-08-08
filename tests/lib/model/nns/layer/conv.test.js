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

	describe('calc', () => {
		test('matrix', () => {
			const layer = new ConvLayer({ kernel: 3, padding: 1 })

			const x = Matrix.randn(10, 3)
			expect(() => layer.calc(x)).toThrowError()
		})

		describe('1d', () => {
			test('kernel:1-2-4 stride:1 padding:0', () => {
				const layer = new ConvLayer({ kernel: 2, stride: 1, w: Tensor.ones([1, 2, 4]) })

				const x = Tensor.randn([10, 3, 1])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([10, 2, 4])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < y.sizes[1]; j++) {
						let v = 0
						for (let s = 0; s < 2; s++) {
							v += x.at(i, j + s, 0)
						}
						for (let c = 0; c < y.sizes[2]; c++) {
							expect(y.at(i, j, c)).toBeCloseTo(v)
						}
					}
				}
			})

			test('kernel:2-2-4 stride:1 padding:0', () => {
				const layer = new ConvLayer({ kernel: 2, stride: 1, w: Tensor.ones([2, 2, 4]) })

				const x = Tensor.randn([10, 3, 2])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([10, 2, 4])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < y.sizes[1]; j++) {
						let v = 0
						for (let s = 0; s < 2; s++) {
							for (let c = 0; c < x.sizes[2]; c++) {
								v += x.at(i, j + s, c)
							}
						}
						for (let c = 0; c < y.sizes[2]; c++) {
							expect(y.at(i, j, c)).toBeCloseTo(v)
						}
					}
				}
			})

			test('kernel:2-2-4 stride:2 padding:0', () => {
				const layer = new ConvLayer({ kernel: 2, stride: 2, w: Tensor.ones([2, 2, 4]) })

				const x = Tensor.randn([10, 3, 2])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([10, 2, 4])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < y.sizes[1]; j++) {
						let v = 0
						for (let s = 0; s < 2; s++) {
							if (j * 2 + s < 0 || j * 2 + s >= x.sizes[1]) {
								continue
							}
							for (let c = 0; c < x.sizes[2]; c++) {
								v += x.at(i, j * 2 + s, c)
							}
						}
						for (let c = 0; c < y.sizes[2]; c++) {
							expect(y.at(i, j, c)).toBeCloseTo(v)
						}
					}
				}
			})

			test('channel 1', () => {
				const layer = new ConvLayer({ kernel: 2, stride: 1, w: Tensor.ones([1, 2, 4]), channel_dim: 1 })

				const x = Tensor.randn([10, 1, 3])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([10, 4, 2])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < y.sizes[2]; j++) {
						let v = 0
						for (let s = 0; s < 2; s++) {
							v += x.at(i, 0, j + s)
						}
						for (let c = 0; c < y.sizes[1]; c++) {
							expect(y.at(i, c, j)).toBeCloseTo(v)
						}
					}
				}
			})
		})

		describe('2d', () => {
			test('kernel:1-2-2-4 stride:1 padding:0', () => {
				const layer = new ConvLayer({ kernel: 2, stride: 1, w: Tensor.ones([1, 2, 2, 4]) })

				const x = Tensor.randn([10, 3, 3, 1])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([10, 2, 2, 4])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < y.sizes[1]; j++) {
						for (let k = 0; k < y.sizes[2]; k++) {
							let v = 0
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									v += x.at(i, j + s, k + t, 0)
								}
							}
							for (let c = 0; c < y.sizes[3]; c++) {
								expect(y.at(i, j, k, c)).toBeCloseTo(v)
							}
						}
					}
				}
			})

			test('kernel:2-2-2-4 stride:1 padding:0', () => {
				const layer = new ConvLayer({ kernel: 2, stride: 1, w: Tensor.ones([2, 2, 2, 4]) })

				const x = Tensor.randn([10, 3, 3, 2])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([10, 2, 2, 4])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < y.sizes[1]; j++) {
						for (let k = 0; k < y.sizes[2]; k++) {
							let v = 0
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									for (let u = 0; u < x.sizes[3]; u++) {
										v += x.at(i, j + s, k + t, u)
									}
								}
							}
							for (let c = 0; c < y.sizes[3]; c++) {
								expect(y.at(i, j, k, c)).toBeCloseTo(v)
							}
						}
					}
				}
			})

			test('kernel:2-3-3-4 stride:1 padding:1', () => {
				const layer = new ConvLayer({ kernel: 3, stride: 1, padding: 1, w: Tensor.ones([2, 3, 3, 4]) })

				const x = Tensor.randn([10, 3, 3, 2])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([10, 3, 3, 4])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < y.sizes[1]; j++) {
						for (let k = 0; k < y.sizes[2]; k++) {
							let v = 0
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
									for (let u = 0; u < x.sizes[3]; u++) {
										v += x.at(i, j + s - 1, k + t - 1, u)
									}
								}
							}
							for (let c = 0; c < y.sizes[3]; c++) {
								expect(y.at(i, j, k, c)).toBeCloseTo(v)
							}
						}
					}
				}
			})

			test('kernel:2-2-3-4 stride:1 padding:1', () => {
				const layer = new ConvLayer({ kernel: [2, 3], stride: 1, w: Tensor.ones([2, 2, 3, 4]) })

				const x = Tensor.randn([10, 3, 3, 2])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([10, 2, 1, 4])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < y.sizes[1]; j++) {
						for (let k = 0; k < y.sizes[2]; k++) {
							let v = 0
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 3; t++) {
									for (let u = 0; u < x.sizes[3]; u++) {
										v += x.at(i, j + s, k + t, u)
									}
								}
							}
							for (let c = 0; c < y.sizes[3]; c++) {
								expect(y.at(i, j, k, c)).toBeCloseTo(v)
							}
						}
					}
				}
			})

			test('kernel:1-2-2-3 stride:3 padding:0', () => {
				const layer = new ConvLayer({ kernel: 2, stride: 3, w: Tensor.ones([1, 2, 2, 3]) })

				const x = Tensor.randn([10, 5, 5, 1])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([10, 2, 2, 3])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < y.sizes[1]; j++) {
						for (let k = 0; k < y.sizes[2]; k++) {
							let v = 0
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									for (let u = 0; u < x.sizes[3]; u++) {
										v += x.at(i, j * 3 + s, k * 3 + t, u)
									}
								}
							}
							for (let c = 0; c < y.sizes[3]; c++) {
								expect(y.at(i, j, k, c)).toBeCloseTo(v)
							}
						}
					}
				}
			})

			test('channel 1', () => {
				const layer = new ConvLayer({ kernel: 2, stride: 1, w: Tensor.ones([1, 2, 2, 4]), channel_dim: 1 })

				const x = Tensor.randn([10, 1, 3, 3])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([10, 4, 2, 2])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < y.sizes[2]; j++) {
						for (let k = 0; k < y.sizes[3]; k++) {
							let v = 0
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									v += x.at(i, 0, j + s, k + t)
								}
							}
							for (let c = 0; c < y.sizes[1]; c++) {
								expect(y.at(i, c, j, k)).toBeCloseTo(v)
							}
						}
					}
				}
			})
		})
	})

	describe('grad', () => {
		test('channel -1', () => {
			const layer = new ConvLayer({ kernel: 3, padding: 1 })

			const x = Tensor.randn([10, 3, 3, 2])
			layer.calc(x)

			const bo = Tensor.randn([10, 3, 3, 4])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 3, 3, 2])
		})

		test('channel 1', () => {
			const layer = new ConvLayer({ kernel: 3, padding: 1, channel_dim: 1 })

			const x = Tensor.randn([10, 2, 3, 3])
			layer.calc(x)

			const bo = Tensor.randn([10, 4, 3, 3])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 2, 3, 3])
		})
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
			channel_dim: -1,
		})
	})

	test('fromObject', () => {
		const orglayer = new ConvLayer({ kernel: 3, padding: 1 })
		orglayer.calc(Tensor.randn([10, 3, 3, 2]))
		const layer = ConvLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(ConvLayer)
	})
})

describe('nn', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'conv', kernel: 3, padding: 1 }, { type: 'flatten' }],
			'mse',
			'adam'
		)
		const x = Tensor.randn([1, 3, 2, 2]).toArray()
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
