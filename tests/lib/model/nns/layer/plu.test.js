import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import PLULayer from '../../../../../lib/model/nns/layer/plu.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new PLULayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new PLULayer({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(
						Math.max(0.1 * (x.at(i, j) + 1) - 1, Math.min(0.1 * (x.at(i, j) - 1) + 1, x.at(i, j)))
					)
				}
			}
		})

		test('tensor', () => {
			const layer = new PLULayer({})

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(
							Math.max(
								0.1 * (x.at(i, j, k) + 1) - 1,
								Math.min(0.1 * (x.at(i, j, k) - 1) + 1, x.at(i, j, k))
							)
						)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new PLULayer({})

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(
						0.1 * (x.at(i, j) + 1) - 1 <= x.at(i, j) && x.at(i, j) <= 0.1 * (x.at(i, j) - 1) + 1 ? 1 : 0.1
					)
				}
			}
		})

		test('tensor', () => {
			const layer = new PLULayer({})

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(
							0.1 * (x.at(i, j, k) + 1) - 1 <= x.at(i, j, k) &&
								x.at(i, j, k) <= 0.1 * (x.at(i, j, k) - 1) + 1
								? 1
								: 0.1
						)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new PLULayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'plu', alpha: 0.1, c: 1 })
	})

	test('fromObject', () => {
		const layer = PLULayer.fromObject({ type: 'plu', alpha: 0.1, c: 1 })
		expect(layer).toBeInstanceOf(PLULayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'plu' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(
					Math.max(0.1 * (x.at(i, j) + 1) - 1, Math.min(0.1 * (x.at(i, j) - 1) + 1, x.at(i, j)))
				)
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'plu' }],
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
