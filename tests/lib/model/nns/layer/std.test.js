import { jest } from '@jest/globals'
jest.retryTimes(5)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import StdLayer from '../../../../../lib/model/nns/layer/std.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new StdLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		describe('matrix', () => {
			test('axis -1', () => {
				const layer = new StdLayer({})

				const x = Matrix.randn(100, 10)
				const y = layer.calc(x)

				const s = x.std()
				expect(y.sizes).toEqual([1, 1])
				expect(y.at(0, 0)).toBeCloseTo(s)
			})
		})

		describe('tensor', () => {
			test('axis -1', () => {
				const layer = new StdLayer({})

				const x = Tensor.randn([100, 20, 10])
				const y = layer.calc(x)

				const m = x.reduce((s, v) => s + v, 0) / x.length
				const s = Math.sqrt(x.reduce((s, v) => s + (v - m) ** 2, 0) / x.length)
				expect(y.sizes).toEqual([1, 1])
				expect(y.at(0, 0)).toBeCloseTo(s)
			})

			test('axis 0', () => {
				const layer = new StdLayer({ axis: 0 })

				const x = Tensor.randn([100, 20, 10])
				const y = layer.calc(x)

				const m = x.reduce((s, v) => s + v, 0, 0, true)
				const d = x.copy()
				d.broadcastOperate(m, (a, b) => a - b / x.sizes[0])
				const v = d.reduce((s, v) => s + v ** 2, 0, 0)
				expect(y.sizes).toEqual([1, 20, 10])
				for (let i = 0; i < x.sizes[1]; i++) {
					for (let j = 0; j < x.sizes[2]; j++) {
						expect(y.at(0, i, j)).toBeCloseTo(Math.sqrt(v.at(i, j) / x.sizes[0]))
					}
				}
			})

			test('axis 1', () => {
				const layer = new StdLayer({ axis: 1 })

				const x = Tensor.randn([100, 20, 10])
				const y = layer.calc(x)

				const m = x.reduce((s, v) => s + v, 0, 1, true)
				const d = x.copy()
				d.broadcastOperate(m, (a, b) => a - b / x.sizes[1])
				const v = d.reduce((s, v) => s + v ** 2, 0, 1)
				expect(y.sizes).toEqual([100, 1, 10])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[2]; j++) {
						expect(y.at(i, 0, j)).toBeCloseTo(Math.sqrt(v.at(i, j) / x.sizes[1]))
					}
				}
			})
		})
	})

	describe('grad', () => {
		describe('matrix', () => {
			test('axis -1', () => {
				const layer = new StdLayer({})

				const x = Matrix.randn(100, 10)
				const y = layer.calc(x)
				const m = x.mean()

				const bo = Matrix.ones(1, 1)
				const bi = layer.grad(bo)
				for (let i = 0; i < x.rows; i++) {
					for (let j = 0; j < x.cols; j++) {
						expect(bi.at(i, j)).toBeCloseTo((x.at(i, j) - m) / (y.at(0, 0) * 1000))
					}
				}
			})
		})

		describe('tensor', () => {
			test('axis -1', () => {
				const layer = new StdLayer({})

				const x = Tensor.randn([100, 20, 10])
				const y = layer.calc(x)
				const m = x.reduce((s, v) => s + v, 0) / x.length

				const bo = Matrix.ones(1, 1)
				const bi = layer.grad(bo)
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[1]; j++) {
						for (let k = 0; k < x.sizes[2]; k++) {
							expect(bi.at(i, j, k)).toBeCloseTo((x.at(i, j, k) - m) / (y.at(0, 0, 0) * 20000))
						}
					}
				}
			})

			test('axis 0', () => {
				const layer = new StdLayer({ axis: 0 })

				const x = Tensor.randn([100, 20, 10])
				const y = layer.calc(x)
				const m = x.reduce((s, v) => s + v, 0, 0)
				m.map(v => v / x.sizes[0])

				const bo = Tensor.ones([1, 20, 10])
				const bi = layer.grad(bo)
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[1]; j++) {
						for (let k = 0; k < x.sizes[2]; k++) {
							expect(bi.at(i, j, k)).toBeCloseTo((x.at(i, j, k) - m.at(j, k)) / (y.at(0, j, k) * 100))
						}
					}
				}
			})

			test('axis 1', () => {
				const layer = new StdLayer({ axis: 1 })

				const x = Tensor.randn([100, 20, 10])
				const y = layer.calc(x)
				const m = x.reduce((s, v) => s + v, 0, 1)
				m.map(v => v / x.sizes[1])

				const bo = Tensor.ones([100, 1, 10])
				const bi = layer.grad(bo)
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[1]; j++) {
						for (let k = 0; k < x.sizes[2]; k++) {
							expect(bi.at(i, j, k)).toBeCloseTo((x.at(i, j, k) - m.at(i, k)) / (y.at(i, 0, k) * 20))
						}
					}
				}
			})
		})
	})

	test('toObject', () => {
		const layer = new StdLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'std', axis: -1 })
	})

	test('fromObject', () => {
		const layer = StdLayer.fromObject({ type: 'std', axis: -1 })
		expect(layer).toBeInstanceOf(StdLayer)
	})
})

describe('nn', () => {
	describe('axis -1', () => {
		test('calc', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'std' }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.std()
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(s)
		})

		test('grad', () => {
			const net = NeuralNetwork.fromObject(
				[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'std' }],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -0.1, 0.1)
			const t = Matrix.random(1, 1, 0.1, 1)

			for (let i = 0; i < 100; i++) {
				const loss = net.fit(x, t, 1000, 0.01)
				if (loss[0] < 1.0e-8) {
					break
				}
			}

			const y = net.calc(x)
			expect(y.at(0, 0)).toBeCloseTo(t.at(0, 0))
		})
	})

	describe.each([0, 1])('axis %i', axis => {
		test('calc', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'std', axis }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.std(axis)
			expect(y.sizes).toEqual(s.sizes)
			for (let i = 0; i < s.rows; i++) {
				for (let j = 0; j < s.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(s.at(i, j))
				}
			}
		})

		test('grad', () => {
			const net = NeuralNetwork.fromObject(
				[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'std', axis }],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -0.1, 0.1)
			const size = axis === 0 ? [1, 3] : [4, 1]
			const t = Matrix.random(...size, 0.5, 1)

			for (let i = 0; i < 100; i++) {
				const loss = net.fit(x, t, 1000, 0.01)
				if (loss[0] < 1.0e-8) {
					break
				}
			}

			const y = net.calc(x)
			for (let i = 0; i < t.rows; i++) {
				for (let j = 0; j < t.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(t.at(i, j))
				}
			}
		})
	})
})
