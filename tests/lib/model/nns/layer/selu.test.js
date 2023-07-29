import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import SELULayer from '../../../../../lib/model/nns/layer/selu.js'

const alpha = 1.67326319217681884765625
const gamma = 1.05070102214813232421875

describe('layer', () => {
	test('construct', () => {
		const layer = new SELULayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new SELULayer({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(
						x.at(i, j) > 0 ? gamma * x.at(i, j) : gamma * alpha * (Math.exp(x.at(i, j)) - 1)
					)
				}
			}
		})

		test('tensor', () => {
			const layer = new SELULayer({})

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) > 0 ? gamma * x.at(i, j, k) : gamma * alpha * (Math.exp(x.at(i, j, k)) - 1)
						)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new SELULayer({})

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(x.at(i, j) > 0 ? gamma : gamma * alpha * Math.exp(x.at(i, j)))
				}
			}
		})

		test('tensor', () => {
			const layer = new SELULayer({})

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) > 0 ? gamma : gamma * alpha * Math.exp(x.at(i, j, k))
						)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new SELULayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'selu', a: alpha })
	})

	test('fromObject', () => {
		const layer = SELULayer.fromObject({ type: 'selu', a: 1 })
		expect(layer).toBeInstanceOf(SELULayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'selu' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(
					x.at(i, j) < 0 ? gamma * alpha * (Math.exp(x.at(i, j)) - 1) : gamma * x.at(i, j)
				)
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'selu' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, -0.5, 10)

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
