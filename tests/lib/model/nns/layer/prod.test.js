import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import ProdLayer from '../../../../../lib/model/nns/layer/prod.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new ProdLayer({})
		expect(layer).toBeDefined()
	})

	test('dependentLayers', () => {
		const layer = new ProdLayer({ axis: 'axis' })
		const dl = layer.dependentLayers
		expect(dl.sort()).toEqual(['axis'].sort())
	})

	describe('calc', () => {
		describe('matrix', () => {
			describe.each([undefined, -1, [-1], [0, 1]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new ProdLayer({ axis })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const m = x.prod()
					expect(y.sizes).toEqual([1, 1])
					expect(y.at(0, 0)).toBeCloseTo(m)
				})

				test('keepdims false', () => {
					const layer = new ProdLayer({ axis, keepdims: false })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const m = x.prod()
					expect(y.sizes).toHaveLength(0)
					expect(y.at()).toBeCloseTo(m)
				})
			})

			describe.each([0, [0]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new ProdLayer({ axis })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const m = x.prod(0)
					expect(y.sizes).toEqual([1, 10])
					for (let i = 0; i < 10; i++) {
						expect(y.at(0, i)).toBeCloseTo(m.at(0, i))
					}
				})

				test('keepdims false', () => {
					const layer = new ProdLayer({ axis: axis, keepdims: false })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const m = x.prod(0)
					expect(y.sizes).toEqual([10])
					for (let i = 0; i < 10; i++) {
						expect(y.at(i)).toBeCloseTo(m.at(0, i))
					}
				})
			})

			describe.each([1, [1]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new ProdLayer({ axis })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const m = x.prod(1)
					expect(y.sizes).toEqual([100, 1])
					for (let i = 0; i < 100; i++) {
						expect(y.at(i, 0)).toBeCloseTo(m.at(i, 0))
					}
				})

				test('keepdims false', () => {
					const layer = new ProdLayer({ axis: axis, keepdims: false })

					const x = Matrix.randn(100, 10)
					const y = layer.calc(x)

					const m = x.prod(1)
					expect(y.sizes).toEqual([100])
					for (let i = 0; i < 100; i++) {
						expect(y.at(i)).toBeCloseTo(m.at(i, 0))
					}
				})
			})
		})

		describe('tensor', () => {
			describe.each([undefined, -1, [-1], [0, 1, 2]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new ProdLayer({ axis })

					const x = Tensor.randn([15, 10, 7])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s * v, 1)
					expect(y.sizes).toEqual([1, 1, 1])
					expect(y.at(0, 0, 0)).toBeCloseTo(m)
				})

				test('keepdims false', () => {
					const layer = new ProdLayer({ axis, keepdims: false })

					const x = Tensor.randn([15, 10, 7])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s * v, 1)
					expect(y.sizes).toHaveLength(0)
					expect(y.at()).toBeCloseTo(m)
				})
			})

			describe.each([0, [0]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new ProdLayer({ axis })

					const x = Tensor.randn([15, 10, 7])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s * v, 1, 0)
					expect(y.sizes).toEqual([1, 10, 7])
					for (let i = 0; i < x.sizes[1]; i++) {
						for (let j = 0; j < x.sizes[2]; j++) {
							expect(y.at(0, i, j)).toBeCloseTo(m.at(i, j))
						}
					}
				})

				test('keepdims false', () => {
					const layer = new ProdLayer({ axis, keepdims: false })

					const x = Tensor.randn([15, 10, 7])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s * v, 1, 0)
					expect(y.sizes).toEqual([10, 7])
					for (let i = 0; i < x.sizes[1]; i++) {
						for (let j = 0; j < x.sizes[2]; j++) {
							expect(y.at(i, j)).toBeCloseTo(m.at(i, j))
						}
					}
				})
			})

			describe.each([1, [1]])('axis %p', axis => {
				test('keepdims true', () => {
					const layer = new ProdLayer({ axis })

					const x = Tensor.randn([15, 10, 7])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s * v, 1, 1)
					expect(y.sizes).toEqual([15, 1, 7])
					for (let i = 0; i < x.sizes[0]; i++) {
						for (let j = 0; j < x.sizes[2]; j++) {
							expect(y.at(i, 0, j)).toBeCloseTo(m.at(i, j))
						}
					}
				})

				test('keepdims false', () => {
					const layer = new ProdLayer({ axis, keepdims: false })

					const x = Tensor.randn([15, 10, 7])
					const y = layer.calc(x)

					const m = x.reduce((s, v) => s * v, 1, 1)
					expect(y.sizes).toEqual([15, 7])
					for (let i = 0; i < x.sizes[0]; i++) {
						for (let j = 0; j < x.sizes[2]; j++) {
							expect(y.at(i, j)).toBeCloseTo(m.at(i, j))
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
					const layer = new ProdLayer({ axis, keepdims })

					const x = Matrix.randn(100, 10)
					layer.calc(x)
					const p = x.prod()

					const bi = layer.grad(bo)
					for (let i = 0; i < x.rows; i++) {
						for (let j = 0; j < x.cols; j++) {
							expect(bi.at(i, j)).toBeCloseTo(p / x.at(i, j))
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
					const layer = new ProdLayer({ axis, keepdims })

					const x = Matrix.randn(100, 10)
					layer.calc(x)
					const p = x.prod(0)

					const bi = layer.grad(bo)
					for (let i = 0; i < x.rows; i++) {
						for (let j = 0; j < x.cols; j++) {
							expect(bi.at(i, j)).toBeCloseTo(p.at(0, j) / x.at(i, j))
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
					const layer = new ProdLayer({ axis, keepdims })

					const x = Matrix.randn(100, 10)
					layer.calc(x)
					const p = x.prod(1)

					const bi = layer.grad(bo)
					for (let i = 0; i < x.rows; i++) {
						for (let j = 0; j < x.cols; j++) {
							expect(bi.at(i, j)).toBeCloseTo(p.at(i, 0) / x.at(i, j))
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
					const layer = new ProdLayer({ axis, keepdims })

					const x = Tensor.randn([15, 10, 7])
					layer.calc(x)
					const p = x.reduce((s, v) => s * v, 1)

					const bi = layer.grad(bo)
					for (let i = 0; i < x.sizes[0]; i++) {
						for (let j = 0; j < x.sizes[1]; j++) {
							for (let k = 0; k < x.sizes[2]; k++) {
								expect(bi.at(i, j, k)).toBeCloseTo(p / x.at(i, j, k))
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
					const layer = new ProdLayer({ axis, keepdims })

					const x = Tensor.randn([15, 10, 7])
					layer.calc(x)
					const p = x.reduce((s, v) => s * v, 1, 0)

					const bi = layer.grad(bo)
					for (let i = 0; i < x.sizes[0]; i++) {
						for (let j = 0; j < x.sizes[1]; j++) {
							for (let k = 0; k < x.sizes[2]; k++) {
								expect(bi.at(i, j, k)).toBeCloseTo(p.at(j, k) / x.at(i, j, k))
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
					const layer = new ProdLayer({ axis, keepdims })

					const x = Tensor.randn([15, 10, 7])
					layer.calc(x)
					const p = x.reduce((s, v) => s * v, 1, 1)

					const bi = layer.grad(bo)
					for (let i = 0; i < x.sizes[0]; i++) {
						for (let j = 0; j < x.sizes[1]; j++) {
							for (let k = 0; k < x.sizes[2]; k++) {
								expect(bi.at(i, j, k)).toBeCloseTo(p.at(i, k) / x.at(i, j, k))
							}
						}
					}
				})
			})
		})
	})

	test('toObject', () => {
		const layer = new ProdLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'prod', axis: [-1], keepdims: true })
	})

	test('fromObject', () => {
		const layer = ProdLayer.fromObject({ type: 'prod', axis: -1 })
		expect(layer).toBeInstanceOf(ProdLayer)
	})
})

describe('nn', () => {
	describe('calc', () => {
		test('axis -1', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'prod' }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.prod()
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(s)
		})

		test.each([0, 1])('axis %i', axis => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'prod', axis }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.prod(axis)
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
					{ type: 'prod', input: 'in', axis: 'axis' },
				],
				'mse',
				'adam'
			)
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.prod(axis)
			expect(y.sizes).toEqual(s.sizes)
			for (let i = 0; i < s.rows; i++) {
				for (let j = 0; j < s.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(s.at(i, j))
				}
			}
		})
	})

	describe.each([
		[-1, undefined, Matrix.random(1, 1, -0.1, 0.1)],
		[-1, true, Matrix.random(1, 1, -0.1, 0.1)],
		[-1, false, Tensor.random([], -0.1, 0.1)],
		[0, undefined, Matrix.random(1, 3, -0.1, 0.1)],
		[0, true, Matrix.random(1, 3, -0.1, 0.1)],
		[0, false, Tensor.random([3], -0.1, 0.1)],
		[1, undefined, Matrix.random(4, 1, -0.1, 0.1)],
		[1, true, Matrix.random(4, 1, -0.1, 0.1)],
		[1, false, Tensor.random([4], -0.1, 0.1)],
	])('grad %p keepdims %p', (axis, keepdims, t) => {
		test('value', () => {
			const net = NeuralNetwork.fromObject(
				[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'prod', axis, keepdims }],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -1, 1)

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
					{ type: 'prod', input: 'a', axis: 'axis', keepdims },
				],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -1, 1)

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
