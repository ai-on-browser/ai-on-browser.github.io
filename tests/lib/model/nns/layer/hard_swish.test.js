import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import Layer from '../../../../../lib/model/nns/layer/base.js'

describe('layer', () => {
	test('construct', () => {
		const layer = Layer.fromObject({ type: 'hard_swish' })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'hard_swish' })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(
						x.at(i, j) <= -3 ? 0 : 3 <= x.at(i, j) ? x.at(i, j) : (x.at(i, j) * (x.at(i, j) + 3)) / 6
					)
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'hard_swish' })

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) <= -3
								? 0
								: 3 <= x.at(i, j, k)
									? x.at(i, j, k)
									: (x.at(i, j, k) * (x.at(i, j, k) + 3)) / 6
						)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'hard_swish' })

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(
						x.at(i, j) <= -3 ? 0 : 3 <= x.at(i, j) ? 1 : (2 * x.at(i, j) + 3) / 6
					)
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'hard_swish' })

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) <= -3 ? 0 : 3 <= x.at(i, j, k) ? 1 : (2 * x.at(i, j, k) + 3) / 6
						)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = Layer.fromObject({ type: 'hard_swish' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'hard_swish' })
	})

	test('fromObject', () => {
		const layer = Layer.fromObject({ type: 'hard_swish' })
		expect(layer).toBeDefined()
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'hard_swish' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(
					x.at(i, j) <= -3 ? 0 : 3 <= x.at(i, j) ? x.at(i, j) : (x.at(i, j) * (x.at(i, j) + 3)) / 6
				)
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3, w: Matrix.random(5, 3, 0, 0.1), b: Matrix.random(1, 3, 0, 0.1) },
				{ type: 'hard_swish' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, 0, 0.1)
		const t = Matrix.random(1, 3, 0, 5)

		for (let i = 0; i < 10; i++) {
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
