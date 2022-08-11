import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import LpPoolLayer from '../../../../../lib/model/nns/layer/lppool.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new LpPoolLayer({ p: 2, kernel: 2 })
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new LpPoolLayer({ p: 2, kernel: [2, 2] })

		const x = Tensor.randn([10, 4, 4, 3])
		const y = layer.calc(x)
		expect(y.sizes).toEqual([10, 2, 2, 3])
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let j = 0; j < 2; j++) {
				for (let k = 0; k < 2; k++) {
					for (let c = 0; c < x.sizes[3]; c++) {
						let sumval = 0
						for (let s = 0; s < 2; s++) {
							for (let t = 0; t < 2; t++) {
								sumval += x.at(i, j * 2 + s, k * 2 + t, c) ** 2
							}
						}
						expect(y.at(i, j, k, c)).toBeCloseTo(Math.sqrt(sumval))
					}
				}
			}
		}
	})

	describe.each([1, 2])('calc %d', p => {
		test('kernel:2 stride:1 padding:0', () => {
			const layer = new LpPoolLayer({ p: p, kernel: 2, stride: 1 })

			const x = Tensor.randn([10, 3, 3, 1])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 2, 2, 1])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < y.sizes[1]; j++) {
					for (let k = 0; k < y.sizes[2]; k++) {
						for (let c = 0; c < y.sizes[3]; c++) {
							let v = 0
							for (let s = 0; s < 2; s++) {
								for (let t = 0; t < 2; t++) {
									v += x.at(i, j + s, k + t, c) ** p
								}
							}
							expect(y.at(i, j, k, c)).toBeCloseTo(v ** (1 / p))
						}
					}
				}
			}
		})

		test('kernel:3 stride:1 padding:1', () => {
			const layer = new LpPoolLayer({ p: p, kernel: 3, stride: 1, padding: 1 })

			const x = Tensor.randn([10, 3, 3, 2])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 3, 3, 2])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < y.sizes[1]; j++) {
					for (let k = 0; k < y.sizes[2]; k++) {
						for (let c = 0; c < y.sizes[3]; c++) {
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
									v += x.at(i, j + s - 1, k + t - 1, c) ** p
								}
							}
							expect(y.at(i, j, k, c)).toBeCloseTo(v ** (1 / p))
						}
					}
				}
			}
		})

		test('kernel:2 stride:2 padding:0', () => {
			const layer = new LpPoolLayer({ p: p, kernel: 2, stride: 2, padding: 0 })

			const x = Tensor.randn([1, 3, 3, 2])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([1, 2, 2, 2])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < y.sizes[1]; j++) {
					for (let k = 0; k < y.sizes[2]; k++) {
						for (let c = 0; c < y.sizes[3]; c++) {
							let v = 0
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
									v += x.at(i, j * 2 + s, k * 2 + t, c) ** p
								}
							}
							expect(y.at(i, j, k, c)).toBeCloseTo(v ** (1 / p))
						}
					}
				}
			}
		})
	})

	test.each([1, 2])('grad %d', p => {
		const layer = new LpPoolLayer({ p: p, kernel: [2, 2] })

		const x = Tensor.randn([10, 4, 4, 3])
		const y = layer.calc(x)

		const bo = Tensor.randn([10, 2, 2, 3])
		const bi = layer.grad(bo)
		expect(bi.sizes).toEqual([10, 4, 4, 3])
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let c = 0; c < x.sizes[3]; c++) {
				const a = Matrix.zeros(4, 4)
				for (let j = 0; j < 2; j++) {
					for (let k = 0; k < 2; k++) {
						for (let s = 0; s < 2; s++) {
							for (let t = 0; t < 2; t++) {
								a.operateAt(
									[j * 2 + s, k * 2 + t],
									v =>
										v +
										bo.at(i, j, k, c) *
											(y.at(i, j, k, c) ** p) ** (1 / p - 1) *
											x.at(i, j * 2 + s, k * 2 + t, c) ** (p - 1)
								)
							}
						}
					}
				}
				for (let j = 0; j < 4; j++) {
					for (let k = 0; k < 4; k++) {
						expect(bi.at(i, j, k, c)).toBeCloseTo(a.at(j, k))
					}
				}
			}
		}
	})

	test('toObject', () => {
		const layer = new LpPoolLayer({ p: 2, kernel: [2, 2] })

		const obj = layer.toObject()
		expect(obj).toEqual({
			type: 'lp_pool',
			p: 2,
			kernel: [2, 2],
			padding: 0,
			stride: [2, 2],
			channel_dim: -1,
		})
	})

	test('fromObject', () => {
		const orglayer = new LpPoolLayer({ p: 2, kernel: [2, 2] })
		const layer = LpPoolLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(LpPoolLayer)
	})
})

describe('nn', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'conv', kernel: 3, padding: 1 },
				{ type: 'lp_pool', kernel: [2, 2] },
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
