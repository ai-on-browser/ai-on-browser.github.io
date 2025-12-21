import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import ArgmaxLayer from '../../../../../lib/model/nns/layer/argmax.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new ArgmaxLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		describe('matrix', () => {
			test.each([undefined, 1, -1])('axis %j', axis => {
				const layer = new ArgmaxLayer({ axis, keepdims: false })

				const x = Matrix.randn(100, 10)
				const y = layer.calc(x)
				expect(y.sizes).toEqual([100])
				const t = x.argmax(1)
				for (let i = 0; i < x.rows; i++) {
					expect(y.at(i)).toBeCloseTo(t.at(i, 0))
				}
			})

			test.each([0, -2])('axis %j', axis => {
				const layer = new ArgmaxLayer({ axis, keepdims: false })

				const x = Matrix.randn(100, 10)
				const y = layer.calc(x)
				expect(y.sizes).toEqual([10])
				const t = x.argmax(0)
				for (let i = 0; i < x.cols; i++) {
					expect(y.at(i)).toBeCloseTo(t.at(0, i))
				}
			})
		})

		describe('matrix keepdims', () => {
			test.each([undefined, 1, -1])('axis %j', axis => {
				const layer = new ArgmaxLayer({ axis })

				const x = Matrix.randn(100, 10)
				const y = layer.calc(x)
				expect(y.sizes).toEqual([100, 1])
				const t = x.argmax(1)
				for (let i = 0; i < x.rows; i++) {
					expect(y.at(i, 0)).toBeCloseTo(t.at(i, 0))
				}
			})

			test.each([0, -2])('axis %j', axis => {
				const layer = new ArgmaxLayer({ axis })

				const x = Matrix.randn(100, 10)
				const y = layer.calc(x)
				expect(y.sizes).toEqual([1, 10])
				const t = x.argmax(0)
				for (let i = 0; i < x.cols; i++) {
					expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
				}
			})
		})

		describe('tensor', () => {
			test.each([undefined, 2, -1])('axis %j', axis => {
				const layer = new ArgmaxLayer({ axis, keepdims: false })

				const x = Tensor.randn([15, 10, 7])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([15, 10])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[1]; j++) {
						let max_v = -Infinity
						let max_k = -1
						for (let k = 0; k < x.sizes[2]; k++) {
							if (max_v < x.at(i, j, k)) {
								max_v = x.at(i, j, k)
								max_k = k
							}
						}
						expect(y.at(i, j)).toBe(max_k)
					}
				}
			})

			test.each([1, -2])('axis %j', axis => {
				const layer = new ArgmaxLayer({ axis, keepdims: false })

				const x = Tensor.randn([15, 10, 7])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([15, 7])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						let max_v = -Infinity
						let max_k = -1
						for (let j = 0; j < x.sizes[1]; j++) {
							if (max_v < x.at(i, j, k)) {
								max_v = x.at(i, j, k)
								max_k = j
							}
						}
						expect(y.at(i, k)).toBe(max_k)
					}
				}
			})

			test.each([0, -3])('axis %j', axis => {
				const layer = new ArgmaxLayer({ axis, keepdims: false })

				const x = Tensor.randn([15, 10, 7])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([10, 7])
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						let max_v = -Infinity
						let max_k = -1
						for (let i = 0; i < x.sizes[0]; i++) {
							if (max_v < x.at(i, j, k)) {
								max_v = x.at(i, j, k)
								max_k = i
							}
						}
						expect(y.at(j, k)).toBe(max_k)
					}
				}
			})
		})

		describe('tensor keepdims', () => {
			test.each([undefined, 2, -1])('axis %j', axis => {
				const layer = new ArgmaxLayer({ axis })

				const x = Tensor.randn([15, 10, 7])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([15, 10, 1])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[1]; j++) {
						let max_v = -Infinity
						let max_k = -1
						for (let k = 0; k < x.sizes[2]; k++) {
							if (max_v < x.at(i, j, k)) {
								max_v = x.at(i, j, k)
								max_k = k
							}
						}
						expect(y.at(i, j, 0)).toBe(max_k)
					}
				}
			})

			test.each([1, -2])('axis %j', axis => {
				const layer = new ArgmaxLayer({ axis })

				const x = Tensor.randn([15, 10, 7])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([15, 1, 7])
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						let max_v = -Infinity
						let max_k = -1
						for (let j = 0; j < x.sizes[1]; j++) {
							if (max_v < x.at(i, j, k)) {
								max_v = x.at(i, j, k)
								max_k = j
							}
						}
						expect(y.at(i, 0, k)).toBe(max_k)
					}
				}
			})

			test.each([0, -3])('axis %j', axis => {
				const layer = new ArgmaxLayer({ axis })

				const x = Tensor.randn([15, 10, 7])
				const y = layer.calc(x)
				expect(y.sizes).toEqual([1, 10, 7])
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						let max_v = -Infinity
						let max_k = -1
						for (let i = 0; i < x.sizes[0]; i++) {
							if (max_v < x.at(i, j, k)) {
								max_v = x.at(i, j, k)
								max_k = i
							}
						}
						expect(y.at(0, j, k)).toBe(max_k)
					}
				}
			})
		})
	})

	describe('grad', () => {
		describe('matrix', () => {
			test.each([undefined, 1, -1])('axis %j', axis => {
				const layer = new ArgmaxLayer({ axis })

				const x = Matrix.randn(100, 10)
				layer.calc(x)

				const bo = Matrix.ones(100, 1)
				const bi = layer.grad(bo)
				expect(bi.sizes).toEqual([100, 10])
			})
		})

		describe('tensor', () => {
			test.each([undefined, 2, -1])('axis %j', axis => {
				const layer = new ArgmaxLayer({ axis })

				const x = Tensor.randn([15, 10, 7])
				layer.calc(x)

				const bo = Tensor.ones([15, 10])
				const bi = layer.grad(bo)
				expect(bi.sizes).toEqual([15, 10, 7])
			})
		})
	})

	test('toObject', () => {
		const layer = new ArgmaxLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'argmax', axis: -1, keepdims: true })
	})

	test('fromObject', () => {
		const layer = ArgmaxLayer.fromObject({ type: 'argmax' })
		expect(layer).toBeInstanceOf(ArgmaxLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'argmax' }])
		const x = Matrix.random(10, 10, 0, 1)

		const y = net.calc(x)
		const t = x.argmax(1)
		for (let i = 0; i < t.rows; i++) {
			for (let j = 0; j < t.cols; j++) {
				expect(y.at(i, j)).toBe(t.at(i, j))
			}
		}
	})

	test('grad', { retry: 3 }, () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 5 }, { type: 'argmax' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 3, -0.1, 0.1)
		const t = new Matrix(1, 1, Math.floor(Math.random() * 5))

		for (let i = 0; i < 1000; i++) {
			const loss = net.fit(x, t, 100, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.rows; i++) {
			expect(y.at(i, 0)).toBeCloseTo(t.at(i, 0))
		}
	})
})
