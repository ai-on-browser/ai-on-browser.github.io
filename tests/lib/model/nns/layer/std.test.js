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

	test('dependentLayers', () => {
		const layer = new StdLayer({ axis: 'axis' })
		const dl = layer.dependentLayers
		expect(dl.sort()).toEqual(['axis'].sort())
	})

	describe('calc', () => {
		describe('matrix', () => {
			describe.each([undefined, -1, [-1], [0, 1]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new StdLayer({ axis })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const s = x.std()
					expect(y.sizes).toEqual([1, 1])
					expect(y.at(0, 0)).toBeCloseTo(s)
				})

				test('keepdims false', () => {
					const layer = new StdLayer({ axis, keepdims: false })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const s = x.std()
					expect(y.sizes).toHaveLength(0)
					expect(y.at()).toBeCloseTo(s)
				})
			})

			describe.each([0, [0]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new StdLayer({ axis })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const s = x.std(0)
					expect(y.sizes).toEqual([1, 10])
					for (let i = 0; i < 10; i++) {
						expect(y.at(0, i)).toBeCloseTo(s.at(0, i))
					}
				})

				test('keepdims false', () => {
					const layer = new StdLayer({ axis, keepdims: false })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const s = x.std(0)
					expect(y.sizes).toEqual([10])
					for (let i = 0; i < 10; i++) {
						expect(y.at(i)).toBeCloseTo(s.at(0, i))
					}
				})
			})

			describe.each([1, [1]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new StdLayer({ axis })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const s = x.std(1)
					expect(y.sizes).toEqual([100, 1])
					for (let i = 0; i < 100; i++) {
						expect(y.at(i, 0)).toBeCloseTo(s.at(i, 0))
					}
				})

				test('keepdims false', () => {
					const layer = new StdLayer({ axis, keepdims: false })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const s = x.std(1)
					expect(y.sizes).toEqual([100])
					for (let i = 0; i < 100; i++) {
						expect(y.at(i)).toBeCloseTo(s.at(i, 0))
					}
				})
			})
		})

		describe('tensor', () => {
			describe.each([undefined, -1, [-1], [0, 1, 2]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new StdLayer({ axis })

					const x = Tensor.randn([15, 10, 7])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s + v, 0) / x.length
					const s = Math.sqrt(x.reduce((s, v) => s + (v - m) ** 2, 0) / x.length)
					expect(y.sizes).toEqual([1, 1, 1])
					expect(y.at(0, 0, 0)).toBeCloseTo(s)
				})

				test('keepdims false', () => {
					const layer = new StdLayer({ axis, keepdims: false })

					const x = Tensor.randn([15, 10, 7])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s + v, 0) / x.length
					const s = Math.sqrt(x.reduce((s, v) => s + (v - m) ** 2, 0) / x.length)
					expect(y.sizes).toHaveLength(0)
					expect(y.at()).toBeCloseTo(s)
				})
			})

			describe.each([0, [0]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new StdLayer({ axis })

					const x = Tensor.randn([15, 10, 7])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s + v, 0, 0, true)
					const d = x.copy()
					d.broadcastOperate(m, (a, b) => a - b / x.sizes[0])
					const v = d.reduce((s, v) => s + v ** 2, 0, 0)
					expect(y.sizes).toEqual([1, 10, 7])
					for (let i = 0; i < x.sizes[1]; i++) {
						for (let j = 0; j < x.sizes[2]; j++) {
							expect(y.at(0, i, j)).toBeCloseTo(Math.sqrt(v.at(i, j) / x.sizes[0]))
						}
					}
				})

				test('keepdims false', () => {
					const layer = new StdLayer({ axis, keepdims: false })

					const x = Tensor.randn([15, 10, 7])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s + v, 0, 0, true)
					const d = x.copy()
					d.broadcastOperate(m, (a, b) => a - b / x.sizes[0])
					const v = d.reduce((s, v) => s + v ** 2, 0, 0)
					expect(y.sizes).toEqual([10, 7])
					for (let i = 0; i < x.sizes[1]; i++) {
						for (let j = 0; j < x.sizes[2]; j++) {
							expect(y.at(i, j)).toBeCloseTo(Math.sqrt(v.at(i, j) / x.sizes[0]))
						}
					}
				})
			})

			describe.each([1, [1]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new StdLayer({ axis })

					const x = Tensor.randn([15, 10, 7])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s + v, 0, 1, true)
					const d = x.copy()
					d.broadcastOperate(m, (a, b) => a - b / x.sizes[1])
					const v = d.reduce((s, v) => s + v ** 2, 0, 1)
					expect(y.sizes).toEqual([15, 1, 7])
					for (let i = 0; i < x.sizes[0]; i++) {
						for (let j = 0; j < x.sizes[2]; j++) {
							expect(y.at(i, 0, j)).toBeCloseTo(Math.sqrt(v.at(i, j) / x.sizes[1]))
						}
					}
				})

				test('keepdims false', () => {
					const layer = new StdLayer({ axis, keepdims: false })

					const x = Tensor.randn([15, 10, 7])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s + v, 0, 1, true)
					const d = x.copy()
					d.broadcastOperate(m, (a, b) => a - b / x.sizes[1])
					const v = d.reduce((s, v) => s + v ** 2, 0, 1)
					expect(y.sizes).toEqual([15, 7])
					for (let i = 0; i < x.sizes[0]; i++) {
						for (let j = 0; j < x.sizes[2]; j++) {
							expect(y.at(i, j)).toBeCloseTo(Math.sqrt(v.at(i, j) / x.sizes[1]))
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
					const layer = new StdLayer({ axis, keepdims })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)
					const m = x.mean()

					const bi = layer.grad(bo)
					for (let i = 0; i < x.rows; i++) {
						for (let j = 0; j < x.cols; j++) {
							expect(bi.at(i, j)).toBeCloseTo((x.at(i, j) - m) / (y.toScaler() * 1000))
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
					const layer = new StdLayer({ axis, keepdims })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)
					const m = x.mean(0)

					const bi = layer.grad(bo)
					for (let i = 0; i < x.rows; i++) {
						for (let j = 0; j < x.cols; j++) {
							expect(bi.at(i, j)).toBeCloseTo(
								(x.at(i, j) - m.at(0, j)) / ((keepdims ?? true ? y.at(0, j) : y.at(j)) * 100)
							)
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
					const layer = new StdLayer({ axis, keepdims })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)
					const m = x.mean(1)

					const bi = layer.grad(bo)
					for (let i = 0; i < x.rows; i++) {
						for (let j = 0; j < x.cols; j++) {
							expect(bi.at(i, j)).toBeCloseTo(
								(x.at(i, j) - m.at(i, 0)) / ((keepdims ?? true ? y.at(i, 0) : y.at(i)) * 10)
							)
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
					const layer = new StdLayer({ axis, keepdims })

					const x = Tensor.randn([15, 10, 7])
					const y = layer.calc(x)
					const m = x.reduce((s, v) => s + v, 0) / x.length

					const bi = layer.grad(bo)
					for (let i = 0; i < x.sizes[0]; i++) {
						for (let j = 0; j < x.sizes[1]; j++) {
							for (let k = 0; k < x.sizes[2]; k++) {
								expect(bi.at(i, j, k)).toBeCloseTo((x.at(i, j, k) - m) / (y.toScaler() * 1050))
							}
						}
					}
				})
			})

			describe.each([0, [0]])('axis %p', axis => {
				test.each([
					[undefined, Tensor.ones([1, 10, 7])],
					[true, Tensor.ones([1, 10, 7])],
					[false, Tensor.ones([10, 7])],
				])('keepdims %p', (keepdims, bo) => {
					const layer = new StdLayer({ axis, keepdims })

					const x = Tensor.randn([15, 10, 7])
					const y = layer.calc(x)
					const m = x.reduce((s, v) => s + v, 0, 0)
					m.map(v => v / x.sizes[0])

					const bi = layer.grad(bo)
					for (let i = 0; i < x.sizes[0]; i++) {
						for (let j = 0; j < x.sizes[1]; j++) {
							for (let k = 0; k < x.sizes[2]; k++) {
								expect(bi.at(i, j, k)).toBeCloseTo(
									(x.at(i, j, k) - m.at(j, k)) /
										((keepdims ?? true ? y.at(0, j, k) : y.at(j, k)) * 15)
								)
							}
						}
					}
				})
			})

			describe.each([1, [1]])('axis %p', axis => {
				test.each([
					[undefined, Tensor.ones([15, 1, 7])],
					[true, Tensor.ones([15, 1, 7])],
					[false, Tensor.ones([15, 7])],
				])('keepdims %p', (keepdims, bo) => {
					const layer = new StdLayer({ axis, keepdims })

					const x = Tensor.randn([15, 10, 7])
					const y = layer.calc(x)
					const m = x.reduce((s, v) => s + v, 0, 1)
					m.map(v => v / x.sizes[1])

					const bi = layer.grad(bo)
					for (let i = 0; i < x.sizes[0]; i++) {
						for (let j = 0; j < x.sizes[1]; j++) {
							for (let k = 0; k < x.sizes[2]; k++) {
								expect(bi.at(i, j, k)).toBeCloseTo(
									(x.at(i, j, k) - m.at(i, k)) /
										((keepdims ?? true ? y.at(i, 0, k) : y.at(i, k)) * 10)
								)
							}
						}
					}
				})
			})
		})
	})

	test('toObject', () => {
		const layer = new StdLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'std', axis: [-1], keepdims: true })
	})

	test('fromObject', () => {
		const layer = StdLayer.fromObject({ type: 'std', axis: -1 })
		expect(layer).toBeInstanceOf(StdLayer)
	})
})

describe('nn', () => {
	describe('calc', () => {
		test('axis -1', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'std' }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.std()
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(s)
		})

		test.each([0, 1])('axis %i', axis => {
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

		test.each([0, 1])('string parameters %i', axis => {
			const net = NeuralNetwork.fromObject(
				[
					{ type: 'input', name: 'in' },
					{ type: 'const', value: [axis], name: 'axis' },
					{ type: 'std', input: 'in', axis: 'axis' },
				],
				'mse',
				'adam'
			)
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
	})

	describe.each([
		[-1, undefined, Matrix.random(1, 1, 0.5, 1)],
		[-1, true, Matrix.random(1, 1, 0.5, 1)],
		[-1, false, Tensor.random([], 0.5, 1)],
		[0, undefined, Matrix.random(1, 3, 0.5, 1)],
		[0, true, Matrix.random(1, 3, 0.5, 1)],
		[0, false, Tensor.random([3], 0.5, 1)],
		[1, undefined, Matrix.random(4, 1, 0.5, 1)],
		[1, true, Matrix.random(4, 1, 0.5, 1)],
		[1, false, Tensor.random([4], 0.5, 1)],
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
