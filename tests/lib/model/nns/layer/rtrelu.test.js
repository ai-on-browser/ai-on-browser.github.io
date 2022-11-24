import { jest } from '@jest/globals'
jest.retryTimes(5)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import RandomTranslationReluLayer from '../../../../../lib/model/nns/layer/rtrelu.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new RandomTranslationReluLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new RandomTranslationReluLayer({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j) >= 0 ? x.at(i, j) : 0)
				}
			}
		})

		test('matrix training', () => {
			const layer = new RandomTranslationReluLayer({})
			layer.bind({ training: true })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			const a = Array(x.cols).fill(-Infinity)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					if (y.at(i, j) > 0 && a[j] === -Infinity) {
						a[j] = y.at(i, j) - x.at(i, j)
					}
				}
			}
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j) + a[j] >= 0 ? x.at(i, j) + a[j] : 0)
				}
			}
		})

		test('tensor', () => {
			const layer = new RandomTranslationReluLayer({})

			const x = Tensor.randn([100, 20, 10])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(x.at(i, j, k) >= 0 ? x.at(i, j, k) : 0)
					}
				}
			}
		})

		test('tensor training', () => {
			const layer = new RandomTranslationReluLayer({})
			layer.bind({ training: true })

			const x = Tensor.randn([100, 20, 10])
			const y = layer.calc(x)
			const a = []
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					if (!a[j]) {
						a[j] = Array(x.sizes[2]).fill(-Infinity)
					}
					for (let k = 0; k < x.sizes[2]; k++) {
						if (y.at(i, j, k) > 0 && a[j][k] === -Infinity) {
							a[j][k] = y.at(i, j, k) - x.at(i, j, k)
						}
					}
				}
			}
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(x.at(i, j, k) + a[j][k] >= 0 ? x.at(i, j, k) + a[j][k] : 0)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new RandomTranslationReluLayer({})
			layer.bind({ training: true })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			const a = Array(x.cols).fill(0)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					if (y.at(i, j) > 0 && !a[j]) {
						a[j] = y.at(i, j) - x.at(i, j)
					}
				}
			}
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBe(x.at(i, j) + a[j] > 0 ? 1 : 0)
				}
			}
		})

		test('tensor', () => {
			const layer = new RandomTranslationReluLayer({})
			layer.bind({ training: true })

			const x = Tensor.randn([100, 20, 10])
			const y = layer.calc(x)

			const bo = Tensor.ones([100, 20, 10])
			const bi = layer.grad(bo)
			const a = []
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					if (!a[j]) {
						a[j] = Array(x.sizes[2]).fill(-Infinity)
					}
					for (let k = 0; k < x.sizes[2]; k++) {
						if (y.at(i, j, k) > 0 && a[j][k] === -Infinity) {
							a[j][k] = y.at(i, j, k) - x.at(i, j, k)
						}
					}
				}
			}
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBe(x.at(i, j, k) + a[j][k] > 0 ? 1 : 0)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new RandomTranslationReluLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'rtrelu' })
	})

	test('fromObject', () => {
		const layer = RandomTranslationReluLayer.fromObject({ type: 'rtrelu' })
		expect(layer).toBeInstanceOf(RandomTranslationReluLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'rtrelu' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		const a = []
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				if (y.at(i, j) > 0 && !a[j]) {
					a[j] = y.at(i, j) - x.at(i, j)
				}
			}
		}
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) + a[j] >= 0 ? x.at(i, j) + a[j] : 0)
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{
					type: 'full',
					out_size: 3,
					w: Matrix.random(5, 3, 0, 1),
					b: Matrix.random(1, 3, 0, 1),
				},
				{ type: 'rtrelu' },
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
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i), 0)
		}
	})
})
