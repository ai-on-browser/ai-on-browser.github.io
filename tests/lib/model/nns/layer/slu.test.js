import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import SLULayer from '../../../../../lib/model/nns/layer/slu.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new SLULayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new SLULayer({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j) >= 0 ? x.at(i, j) : Math.log(Math.exp(x.at(i, j)) + 1))
				}
			}
		})

		test('tensor', () => {
			const layer = new SLULayer({})

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) >= 0 ? x.at(i, j, k) : Math.log(Math.exp(x.at(i, j, k)) + 1)
						)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new SLULayer({})

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBe(x.at(i, j) >= 0 ? 1 : Math.exp(x.at(i, j)) / (Math.exp(x.at(i, j)) + 1))
				}
			}
		})

		test('tensor', () => {
			const layer = new SLULayer({})

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBe(
							x.at(i, j, k) >= 0 ? 1 : Math.exp(x.at(i, j, k)) / (Math.exp(x.at(i, j, k)) + 1)
						)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new SLULayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'slu', alpha: 1, beta: 1, gamma: 0 })
	})

	test('fromObject', () => {
		const layer = SLULayer.fromObject({ type: 'slu', alpha: 1, beta: 1, gamma: 0 })
		expect(layer).toBeInstanceOf(SLULayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'slu' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) >= 0 ? x.at(i, j) : Math.log(Math.exp(x.at(i, j)) + 1))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3, w: new Matrix(5, 3, 0.1), b: [[-0.1, 0.1, 0]] },
				{ type: 'slu' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, 0, 2)

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
