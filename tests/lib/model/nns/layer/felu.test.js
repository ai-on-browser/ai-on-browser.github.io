import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import FELULayer from '../../../../../lib/model/nns/layer/felu.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new FELULayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new FELULayer({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(
						x.at(i, j) >= 0 ? x.at(i, j) : Math.exp(x.at(i, j) / Math.log(2)) - 1
					)
				}
			}
		})

		test('tensor', () => {
			const layer = new FELULayer({})

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) >= 0 ? x.at(i, j, k) : Math.exp(x.at(i, j, k) / Math.log(2)) - 1
						)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new FELULayer({})

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(
						x.at(i, j) >= 0 ? 1 : Math.exp(x.at(i, j) / Math.log(2)) / Math.log(2)
					)
				}
			}
		})

		test('tensor', () => {
			const layer = new FELULayer({})

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) >= 0 ? 1 : Math.exp(x.at(i, j, k) / Math.log(2)) / Math.log(2)
						)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new FELULayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'felu', alpha: 1 })
	})

	test('fromObject', () => {
		const layer = FELULayer.fromObject({ type: 'felu', alpha: 1 })
		expect(layer).toBeInstanceOf(FELULayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'felu' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) >= 0 ? x.at(i, j) : Math.exp(x.at(i, j) / Math.log(2)) - 1)
			}
		}
	})

	test('grad', { retry: 3 }, () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3, w: Matrix.random(5, 3, -0.1, 0.1), b: [[-0.1, 0.1, 0]] },
				{ type: 'felu' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
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
