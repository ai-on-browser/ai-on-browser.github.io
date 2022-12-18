import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import Layer from '../../../../../lib/model/nns/layer/base.js'

const erf = z => {
	const p = 0.3275911
	const a1 = 0.254829592
	const a2 = -0.284496736
	const a3 = 1.421413741
	const a4 = -1.453152027
	const a5 = 1.061405429

	const sign = z < 0 ? -1 : 1
	const t = 1 / (1 + p * Math.abs(z))
	const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z)
	return sign * erf
}

describe('layer', () => {
	test('construct', () => {
		const layer = Layer.fromObject({ type: 'erf' })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'erf' })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(erf(x.at(i, j)))
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'erf' })

			const x = Tensor.randn([100, 20, 10])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(erf(x.at(i, j, k)))
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'erf' })

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo((2 * Math.exp(-(x.at(i, j) ** 2))) / Math.sqrt(Math.PI))
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'erf' })

			const x = Tensor.randn([100, 20, 10])
			layer.calc(x)

			const bo = Tensor.ones([100, 20, 10])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo((2 * Math.exp(-(x.at(i, j, k) ** 2))) / Math.sqrt(Math.PI))
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = Layer.fromObject({ type: 'erf' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'erf' })
	})

	test('fromObject', () => {
		const layer = Layer.fromObject({ type: 'erf' })
		expect(layer).toBeDefined()
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'erf' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(erf(x.at(i, j)))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'erf' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, -0.8, 0.8)

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
