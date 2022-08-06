import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import ReverseLayer from '../../../../../lib/model/nns/layer/reverse.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new ReverseLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		describe('matrix', () => {
			test('axis 1', () => {
				const layer = new ReverseLayer({})

				const x = Matrix.randn(100, 10)
				const y = layer.calc(x)
				for (let i = 0; i < x.rows; i++) {
					for (let j = 0; j < x.cols; j++) {
						expect(y.at(i, j)).toBe(x.at(i, x.cols - j - 1))
					}
				}
			})
		})

		describe('tensor', () => {
			test('axis 1', () => {
				const layer = new ReverseLayer({})

				const x = Tensor.randn([100, 20, 10])
				const y = layer.calc(x)
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[1]; j++) {
						for (let k = 0; k < x.sizes[2]; k++) {
							expect(y.at(i, j, k)).toBe(x.at(i, x.sizes[1] - j - 1, k))
						}
					}
				}
			})

			test('axis 2', () => {
				const layer = new ReverseLayer({ axis: 2 })

				const x = Tensor.randn([100, 20, 10])
				const y = layer.calc(x)
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[1]; j++) {
						for (let k = 0; k < x.sizes[2]; k++) {
							expect(y.at(i, j, k)).toBe(x.at(i, j, x.sizes[2] - k - 1))
						}
					}
				}
			})
		})
	})

	describe('grad', () => {
		describe('matrix', () => {
			test('axis 1', () => {
				const layer = new ReverseLayer({})

				const x = Matrix.randn(100, 10)
				layer.calc(x)

				const bo = Matrix.ones(100, 10)
				const bi = layer.grad(bo)
				for (let i = 0; i < x.rows; i++) {
					for (let j = 0; j < x.cols; j++) {
						expect(bi.at(i, j)).toBe(1)
					}
				}
			})
		})

		describe('tensor', () => {
			test('axis 1', () => {
				const layer = new ReverseLayer({})

				const x = Tensor.randn([100, 20, 10])
				layer.calc(x)

				const bo = Tensor.ones([100, 20, 10])
				const bi = layer.grad(bo)
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[1]; j++) {
						for (let k = 0; k < x.sizes[2]; k++) {
							expect(bi.at(i, j, k)).toBe(1)
						}
					}
				}
			})

			test('axis 2', () => {
				const layer = new ReverseLayer({ axis: 2 })

				const x = Tensor.randn([100, 20, 10])
				layer.calc(x)

				const bo = Tensor.ones([100, 20, 10])
				const bi = layer.grad(bo)
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[1]; j++) {
						for (let k = 0; k < x.sizes[2]; k++) {
							expect(bi.at(i, j, k)).toBe(1)
						}
					}
				}
			})
		})
	})

	test('toObject', () => {
		const layer = new ReverseLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'reverse', axis: 1 })
	})

	test('fromObject', () => {
		const layer = ReverseLayer.fromObject({ type: 'reverse', axis: 1 })
		expect(layer).toBeInstanceOf(ReverseLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'reverse' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, x.cols - j - 1))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'reverse' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.randn(1, 3)

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
