import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import PDELULayer from '../../../../../lib/model/nns/layer/pdelu.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new PDELULayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new PDELULayer({})

			const x = Matrix.random(100, 10, -1, 2)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(
						x.at(i, j) >= 0 ? x.at(i, j) : (1 + 0.9 * x.at(i, j)) ** (1 / 0.9) - 1
					)
				}
			}
		})

		test('tensor', () => {
			const layer = new PDELULayer({})

			const x = Tensor.random([15, 10, 7], -1, 2)
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) >= 0 ? x.at(i, j, k) : (1 + 0.9 * x.at(i, j, k)) ** (1 / 0.9) - 1
						)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new PDELULayer({})

			const x = Matrix.random(100, 10, -1, 2)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(x.at(i, j) >= 0 ? 1 : (1 + 0.9 * x.at(i, j)) ** (0.1 / 0.9))
				}
			}
		})

		test('tensor', () => {
			const layer = new PDELULayer({})

			const x = Tensor.random([15, 10, 7], -1, 2)
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) >= 0 ? 1 : (1 + 0.9 * x.at(i, j, k)) ** (0.1 / 0.9)
						)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new PDELULayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'pdelu', t: 0.1, alpha: 1 })
	})

	test('fromObject', () => {
		const layer = PDELULayer.fromObject({ type: 'pdelu', t: 0.1, alpha: 1 })
		expect(layer).toBeInstanceOf(PDELULayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'pdelu' }])
		const x = Matrix.random(10, 10, -1, 2)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) >= 0 ? x.at(i, j) : (1 + 0.9 * x.at(i, j)) ** (1 / 0.9) - 1)
			}
		}
	})

	test('grad', { retry: 3 }, () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3, w: Matrix.random(5, 3, -0.1, 0.1), b: [[-0.1, 0.1, 0]] },
				{ type: 'pdelu' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, -1, 1)

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
