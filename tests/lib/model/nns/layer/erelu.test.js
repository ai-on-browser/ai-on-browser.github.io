import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import ElasticReluLayer from '../../../../../lib/model/nns/layer/erelu.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new ElasticReluLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new ElasticReluLayer({})
			layer.bind({ training: true })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			const r = Array(x.cols).fill(0)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					if (x.at(i, j) > 0 && !r[j]) {
						r[j] = y.at(i, j) / x.at(i, j)
					}
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j) >= 0 ? x.at(i, j) * r[j] : 0)
				}
			}
		})

		test('tensor', () => {
			const layer = new ElasticReluLayer({})
			layer.bind({ training: true })

			const x = Tensor.randn([100, 20, 10])
			const y = layer.calc(x)
			const r = []
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					if (!r[j]) {
						r[j] = []
					}
					for (let k = 0; k < x.sizes[2]; k++) {
						if (x.at(i, j, k) > 0 && !r[j][k]) {
							r[j][k] = y.at(i, j, k) / x.at(i, j, k)
						}
						expect(y.at(i, j, k)).toBeCloseTo(x.at(i, j, k) >= 0 ? x.at(i, j, k) * r[j][k] : 0)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new ElasticReluLayer({})
			layer.bind({ training: true })

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			const r = Array(x.cols).fill(0)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					if (x.at(i, j) > 0 && !r[j]) {
						r[j] = bi.at(i, j)
					}
					expect(bi.at(i, j)).toBe(x.at(i, j) >= 0 ? r[j] : 0)
				}
			}
		})

		test('tensor', () => {
			const layer = new ElasticReluLayer({})
			layer.bind({ training: true })

			const x = Tensor.randn([100, 20, 10])
			layer.calc(x)

			const bo = Tensor.ones([100, 20, 10])
			const bi = layer.grad(bo)
			const r = []
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					if (!r[j]) {
						r[j] = []
					}
					for (let k = 0; k < x.sizes[2]; k++) {
						if (x.at(i, j, k) > 0 && !r[j][k]) {
							r[j][k] = bi.at(i, j, k)
						}
						expect(bi.at(i, j, k)).toBe(x.at(i, j, k) >= 0 ? r[j][k] : 0)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new ElasticReluLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'erelu' })
	})

	test('fromObject', () => {
		const layer = ElasticReluLayer.fromObject({ type: 'erelu' })
		expect(layer).toBeInstanceOf(ElasticReluLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'erelu' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		const r = []
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				if (x.at(i, j) > 0 && !r[j]) {
					r[j] = y.at(i, j) / x.at(i, j)
				}
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) >= 0 ? x.at(i, j) * r[j] : 0)
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 100, w: Matrix.random(5, 100, 0, 0.1), b: Matrix.random(1, 100, 0, 0.1) },
				{ type: 'erelu' },
				{ type: 'reshape', size: [10, 10] },
				{ type: 'sum', axis: 2 },
				{ type: 'flatten' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, 0, 0.1)
		const t = Matrix.random(1, 10, 0, 5)

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
