import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import ThresholdedReLULayer from '../../../../../lib/model/nns/layer/thresholded_relu.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new ThresholdedReLULayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new ThresholdedReLULayer({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j) > 1 ? x.at(i, j) : 0)
				}
			}
		})

		test('tensor', () => {
			const layer = new ThresholdedReLULayer({})

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(x.at(i, j, k) > 1 ? x.at(i, j, k) : 0)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new ThresholdedReLULayer({})

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBe(x.at(i, j) > 1 ? 1 : 0)
				}
			}
		})

		test('tensor', () => {
			const layer = new ThresholdedReLULayer({})

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBe(x.at(i, j, k) > 1 ? 1 : 0)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new ThresholdedReLULayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'thresholded_relu', a: 1 })
	})

	test('fromObject', () => {
		const layer = ThresholdedReLULayer.fromObject({ type: 'thresholded_relu', a: 1 })
		expect(layer).toBeInstanceOf(ThresholdedReLULayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'thresholded_relu' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) * (x.at(i, j) < 1 ? 0 : 1))
			}
		}
	})

	test('grad', { retry: 5 }, () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 100 },
				{ type: 'thresholded_relu' },
				{ type: 'reshape', size: [10, 10] },
				{ type: 'sum', axis: 2 },
				{ type: 'flatten' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 10, 1, 10)

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
