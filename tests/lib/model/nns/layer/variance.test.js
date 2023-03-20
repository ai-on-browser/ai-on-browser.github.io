import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import VarianceLayer from '../../../../../lib/model/nns/layer/variance.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new VarianceLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		describe('matrix', () => {
			describe.each([undefined, -1, [-1], [0, 1]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new VarianceLayer({ axis })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const v = x.variance()
					expect(y.sizes).toEqual([1, 1])
					expect(y.at(0, 0)).toBeCloseTo(v)
				})

				test('keepdims false', () => {
					const layer = new VarianceLayer({ axis, keepdims: false })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const v = x.variance()
					expect(y.sizes).toHaveLength(0)
					expect(y.at()).toBeCloseTo(v)
				})
			})

			describe.each([0, [0]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new VarianceLayer({ axis })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const v = x.variance(0)
					expect(y.sizes).toEqual([1, 10])
					for (let i = 0; i < 10; i++) {
						expect(y.at(0, i)).toBeCloseTo(v.at(0, i))
					}
				})

				test('keepdims false', () => {
					const layer = new VarianceLayer({ axis, keepdims: false })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const v = x.variance(0)
					expect(y.sizes).toEqual([10])
					for (let i = 0; i < 10; i++) {
						expect(y.at(i)).toBeCloseTo(v.at(0, i))
					}
				})
			})

			describe.each([1, [1]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new VarianceLayer({ axis })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const v = x.variance(1)
					expect(y.sizes).toEqual([100, 1])
					for (let i = 0; i < 100; i++) {
						expect(y.at(i, 0)).toBeCloseTo(v.at(i, 0))
					}
				})

				test('keepdims false', () => {
					const layer = new VarianceLayer({ axis, keepdims: false })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const v = x.variance(1)
					expect(y.sizes).toEqual([100])
					for (let i = 0; i < 100; i++) {
						expect(y.at(i)).toBeCloseTo(v.at(i, 0))
					}
				})
			})
		})

		describe('tensor', () => {
			describe.each([undefined, -1, [-1], [0, 1, 2]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new VarianceLayer({ axis })

					const x = Tensor.randn([100, 20, 10])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s + v, 0) / x.length
					const v = x.reduce((s, v) => s + (v - m) ** 2, 0) / x.length
					expect(y.sizes).toEqual([1, 1, 1])
					expect(y.at(0, 0, 0)).toBeCloseTo(v)
				})

				test('keepdims false', () => {
					const layer = new VarianceLayer({ axis, keepdims: false })

					const x = Tensor.randn([100, 20, 10])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s + v, 0) / x.length
					const v = x.reduce((s, v) => s + (v - m) ** 2, 0) / x.length
					expect(y.sizes).toHaveLength(0)
					expect(y.at()).toBeCloseTo(v)
				})
			})

			describe.each([0, [0]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new VarianceLayer({ axis })

					const x = Tensor.randn([100, 20, 10])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s + v, 0, 0, true)
					const d = x.copy()
					d.broadcastOperate(m, (a, b) => a - b / x.sizes[0])
					const v = d.reduce((s, v) => s + v ** 2, 0, 0)
					expect(y.sizes).toEqual([1, 20, 10])
					for (let i = 0; i < x.sizes[1]; i++) {
						for (let j = 0; j < x.sizes[2]; j++) {
							expect(y.at(0, i, j)).toBeCloseTo(v.at(i, j) / x.sizes[0])
						}
					}
				})

				test('keepdims false', () => {
					const layer = new VarianceLayer({ axis, keepdims: false })

					const x = Tensor.randn([100, 20, 10])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s + v, 0, 0, true)
					const d = x.copy()
					d.broadcastOperate(m, (a, b) => a - b / x.sizes[0])
					const v = d.reduce((s, v) => s + v ** 2, 0, 0)
					expect(y.sizes).toEqual([20, 10])
					for (let i = 0; i < x.sizes[1]; i++) {
						for (let j = 0; j < x.sizes[2]; j++) {
							expect(y.at(i, j)).toBeCloseTo(v.at(i, j) / x.sizes[0])
						}
					}
				})
			})

			describe.each([1, [1]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new VarianceLayer({ axis })

					const x = Tensor.randn([100, 20, 10])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s + v, 0, 1, true)
					const d = x.copy()
					d.broadcastOperate(m, (a, b) => a - b / x.sizes[1])
					const v = d.reduce((s, v) => s + v ** 2, 0, 1)
					expect(y.sizes).toEqual([100, 1, 10])
					for (let i = 0; i < x.sizes[0]; i++) {
						for (let j = 0; j < x.sizes[2]; j++) {
							expect(y.at(i, 0, j)).toBeCloseTo(v.at(i, j) / x.sizes[1])
						}
					}
				})

				test('keepdims false', () => {
					const layer = new VarianceLayer({ axis, keepdims: false })

					const x = Tensor.randn([100, 20, 10])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s + v, 0, 1, true)
					const d = x.copy()
					d.broadcastOperate(m, (a, b) => a - b / x.sizes[1])
					const v = d.reduce((s, v) => s + v ** 2, 0, 1)
					expect(y.sizes).toEqual([100, 10])
					for (let i = 0; i < x.sizes[0]; i++) {
						for (let j = 0; j < x.sizes[2]; j++) {
							expect(y.at(i, j)).toBeCloseTo(v.at(i, j) / x.sizes[1])
						}
					}
				})
			})
		})
	})

	describe('grad', () => {
		describe('matrix', () => {
			describe.each([undefined, -1, [-1], [0, 1]])('axis %p', axis => {
				test.each([
					[undefined, Matrix.ones(1, 1)],
					[true, Matrix.ones(1, 1)],
					[false, Tensor.ones([])],
				])('keepdims %p', (keepdims, bo) => {
					const layer = new VarianceLayer({ axis, keepdims })

					const x = Matrix.randn(100, 10)
					layer.calc(x)
					const m = x.mean()

					const bi = layer.grad(bo)
					for (let i = 0; i < x.rows; i++) {
						for (let j = 0; j < x.cols; j++) {
							expect(bi.at(i, j)).toBeCloseTo(((x.at(i, j) - m) * 2) / 1000)
						}
					}
				})
			})

			describe.each([0, [0]])('axis %p', axis => {
				test.each([
					[undefined, Matrix.ones(1, 10)],
					[true, Matrix.ones(1, 10)],
					[false, Tensor.ones([10])],
				])('keepdims %p', (keepdims, bo) => {
					const layer = new VarianceLayer({ axis, keepdims })

					const x = Matrix.randn(100, 10)
					layer.calc(x)
					const m = x.mean(0)

					const bi = layer.grad(bo)
					for (let i = 0; i < x.rows; i++) {
						for (let j = 0; j < x.cols; j++) {
							expect(bi.at(i, j)).toBeCloseTo(((x.at(i, j) - m.at(0, j)) * 2) / 100)
						}
					}
				})
			})

			describe.each([1, [1]])('axis %p', axis => {
				test.each([
					[undefined, Matrix.ones(100, 1)],
					[true, Matrix.ones(100, 1)],
					[false, Tensor.ones([100])],
				])('keepdims %p', (keepdims, bo) => {
					const layer = new VarianceLayer({ axis, keepdims })

					const x = Matrix.randn(100, 10)
					layer.calc(x)
					const m = x.mean(1)

					const bi = layer.grad(bo)
					for (let i = 0; i < x.rows; i++) {
						for (let j = 0; j < x.cols; j++) {
							expect(bi.at(i, j)).toBeCloseTo(((x.at(i, j) - m.at(i, 0)) * 2) / 10)
						}
					}
				})
			})
		})

		describe('tensor', () => {
			describe.each([undefined, -1, [-1], [0, 1, 2]])('axis %p', axis => {
				test.each([
					[undefined, Tensor.ones([1, 1, 1])],
					[true, Tensor.ones([1, 1, 1])],
					[false, Tensor.ones([])],
				])('keepdims %p', (keepdims, bo) => {
					const layer = new VarianceLayer({ axis, keepdims })

					const x = Tensor.randn([100, 20, 10])
					layer.calc(x)
					const m = x.reduce((s, v) => s + v, 0) / x.length

					const bi = layer.grad(bo)
					for (let i = 0; i < x.sizes[0]; i++) {
						for (let j = 0; j < x.sizes[1]; j++) {
							for (let k = 0; k < x.sizes[2]; k++) {
								expect(bi.at(i, j, k)).toBeCloseTo(((x.at(i, j, k) - m) * 2) / 20000)
							}
						}
					}
				})
			})

			describe.each([0, [0]])('axis %p', axis => {
				test.each([
					[undefined, Tensor.ones([1, 20, 10])],
					[true, Tensor.ones([1, 20, 10])],
					[false, Tensor.ones([20, 10])],
				])('keepdims %p', (keepdims, bo) => {
					const layer = new VarianceLayer({ axis, keepdims })

					const x = Tensor.randn([100, 20, 10])
					layer.calc(x)
					const m = x.reduce((s, v) => s + v, 0, 0)
					m.map(v => v / x.sizes[0])

					const bi = layer.grad(bo)
					for (let i = 0; i < x.sizes[0]; i++) {
						for (let j = 0; j < x.sizes[1]; j++) {
							for (let k = 0; k < x.sizes[2]; k++) {
								expect(bi.at(i, j, k)).toBeCloseTo(((x.at(i, j, k) - m.at(j, k)) * 2) / 100)
							}
						}
					}
				})
			})

			describe.each([1, [1]])('axis %p', axis => {
				test.each([
					[undefined, Tensor.ones([100, 1, 10])],
					[true, Tensor.ones([100, 1, 10])],
					[false, Tensor.ones([100, 10])],
				])('keepdims %p', (keepdims, bo) => {
					const layer = new VarianceLayer({ axis, keepdims })

					const x = Tensor.randn([100, 20, 10])
					layer.calc(x)
					const m = x.reduce((s, v) => s + v, 0, 1)
					m.map(v => v / x.sizes[1])

					const bi = layer.grad(bo)
					for (let i = 0; i < x.sizes[0]; i++) {
						for (let j = 0; j < x.sizes[1]; j++) {
							for (let k = 0; k < x.sizes[2]; k++) {
								expect(bi.at(i, j, k)).toBeCloseTo(((x.at(i, j, k) - m.at(i, k)) * 2) / 20)
							}
						}
					}
				})
			})
		})
	})

	test('toObject', () => {
		const layer = new VarianceLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'variance', axis: [-1], keepdims: true })
	})

	test('fromObject', () => {
		const layer = VarianceLayer.fromObject({ type: 'variance', axis: -1 })
		expect(layer).toBeInstanceOf(VarianceLayer)
	})
})

describe('nn', () => {
	describe('calc', () => {
		test('axis -1', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'variance' }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.variance()
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(s)
		})

		test.each([0, 1])('axis %i', axis => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'variance', axis }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.variance(axis)
			expect(y.sizes).toEqual(s.sizes)
			for (let i = 0; i < s.rows; i++) {
				for (let j = 0; j < s.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(s.at(i, j))
				}
			}
		})

		test.each([0, 1])('string parameters %i', axis => {
			const net = NeuralNetwork.fromObject(
				[
					{ type: 'input', name: 'in' },
					{ type: 'const', value: [axis], name: 'axis' },
					{ type: 'variance', input: 'in', axis: 'axis' },
				],
				'mse',
				'adam'
			)
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.variance(axis)
			expect(y.sizes).toEqual(s.sizes)
			for (let i = 0; i < s.rows; i++) {
				for (let j = 0; j < s.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(s.at(i, j))
				}
			}
		})
	})

	describe.each([
		[-1, undefined, Matrix.random(1, 1, 0.1, 1)],
		[-1, true, Matrix.random(1, 1, 0.1, 1)],
		[-1, false, Tensor.random([], 0.1, 1)],
		[0, undefined, Matrix.random(1, 3, 0.1, 1)],
		[0, true, Matrix.random(1, 3, 0.1, 1)],
		[0, false, Tensor.random([3], 0.1, 1)],
		[1, undefined, Matrix.random(4, 1, 0.1, 1)],
		[1, true, Matrix.random(4, 1, 0.1, 1)],
		[1, false, Tensor.random([4], 0.1, 1)],
	])('grad %p keepdims %p', (axis, keepdims, t) => {
		test('value', () => {
			const net = NeuralNetwork.fromObject(
				[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'variance', axis, keepdims }],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -0.1, 0.1)

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

		test('string parameters', () => {
			const net = NeuralNetwork.fromObject(
				[
					{ type: 'input' },
					{ type: 'full', out_size: 3, name: 'a' },
					{ type: 'const', value: axis, name: 'axis' },
					{ type: 'variance', input: 'a', axis: 'axis', keepdims },
				],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -0.1, 0.1)

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
