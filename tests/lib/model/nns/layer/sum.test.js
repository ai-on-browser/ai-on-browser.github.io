import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import SumLayer from '../../../../../lib/model/nns/layer/sum.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new SumLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		describe('matrix', () => {
			test('axis -1', () => {
				const layer = new SumLayer({})

				const x = Matrix.randn(100, 10)
				const y = layer.calc(x)

				const m = x.sum()
				expect(y.sizes).toEqual([1, 1])
				expect(y.at(0, 0)).toBeCloseTo(m)
			})
		})

		describe('tensor', () => {
			test('axis -1', () => {
				const layer = new SumLayer({})

				const x = Tensor.randn([100, 20, 10])
				const y = layer.calc(x)

				const m = x.reduce((s, v) => s + v, 0)
				expect(y.sizes).toEqual([1, 1])
				expect(y.at(0, 0)).toBeCloseTo(m)
			})

			test('axis 0', () => {
				const layer = new SumLayer({ axis: 0 })

				const x = Tensor.randn([100, 20, 10])
				const y = layer.calc(x)

				const m = x.reduce((s, v) => s + v, 0, 0)
				expect(y.sizes).toEqual([1, 20, 10])
				for (let i = 0; i < x.sizes[1]; i++) {
					for (let j = 0; j < x.sizes[2]; j++) {
						expect(y.at(0, i, j)).toBeCloseTo(m.at(i, j))
					}
				}
			})

			test('axis 1', () => {
				const layer = new SumLayer({ axis: 1 })

				const x = Tensor.randn([100, 20, 10])
				const y = layer.calc(x)

				const m = x.reduce((s, v) => s + v, 0, 1)
				expect(y.sizes).toEqual([100, 1, 10])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[2]; j++) {
						expect(y.at(i, 0, j)).toBeCloseTo(m.at(i, j))
					}
				}
			})
		})
	})

	describe('grad', () => {
		describe('matrix', () => {
			test('axis -1', () => {
				const layer = new SumLayer({})

				const x = Matrix.randn(100, 10)
				layer.calc(x)

				const bo = Matrix.ones(1, 1)
				const bi = layer.grad(bo)
				for (let i = 0; i < x.rows; i++) {
					for (let j = 0; j < x.cols; j++) {
						expect(bi.at(i, j)).toBe(1)
					}
				}
			})
		})

		describe('tensor', () => {
			test('axis -1', () => {
				const layer = new SumLayer({})

				const x = Tensor.randn([100, 20, 10])
				layer.calc(x)

				const bo = Matrix.ones(1, 1)
				const bi = layer.grad(bo)
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[1]; j++) {
						for (let k = 0; k < x.sizes[2]; k++) {
							expect(bi.at(i, j, k)).toBe(1)
						}
					}
				}
			})

			test('axis 0', () => {
				const layer = new SumLayer({ axis: 0 })

				const x = Tensor.randn([100, 20, 10])
				layer.calc(x)

				const bo = Tensor.ones([1, 20, 10])
				const bi = layer.grad(bo)
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[1]; j++) {
						for (let k = 0; k < x.sizes[2]; k++) {
							expect(bi.at(i, j, k)).toBeCloseTo(1)
						}
					}
				}
			})

			test('axis 1', () => {
				const layer = new SumLayer({ axis: 1 })

				const x = Tensor.randn([100, 20, 10])
				layer.calc(x)

				const bo = Tensor.ones([100, 1, 10])
				const bi = layer.grad(bo)
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[1]; j++) {
						for (let k = 0; k < x.sizes[2]; k++) {
							expect(bi.at(i, j, k)).toBeCloseTo(1)
						}
					}
				}
			})
		})
	})

	test('toObject', () => {
		const layer = new SumLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'sum', axis: -1 })
	})

	test('fromObject', () => {
		const layer = SumLayer.fromObject({ type: 'sum', axis: -1 })
		expect(layer).toBeInstanceOf(SumLayer)
	})
})

describe('nn', () => {
	describe('axis -1', () => {
		test('calc', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'sum' }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.sum()
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(s)
		})

		test('grad', () => {
			const net = NeuralNetwork.fromObject(
				[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'sum' }],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -0.1, 0.1)
			const t = Matrix.random(1, 1, -0.1, 0.1)

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
			const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'sum', axis }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.sum(axis)
			expect(y.sizes).toEqual(s.sizes)
			for (let i = 0; i < s.rows; i++) {
				for (let j = 0; j < s.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(s.at(i, j))
				}
			}
		})

		test('grad', () => {
			const net = NeuralNetwork.fromObject(
				[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'sum', axis }],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -0.1, 0.1)
			const size = axis === 0 ? [1, 3] : [4, 1]
			const t = Matrix.random(...size, -0.1, 0.1)

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
