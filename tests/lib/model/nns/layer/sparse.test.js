import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import SparseLayer from '../../../../../lib/model/nns/layer/sparse.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new SparseLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new SparseLayer({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j))
				}
			}
		})

		test('tensor', () => {
			const layer = new SparseLayer({})

			const x = Tensor.randn([15, 10, 7])
			expect(() => layer.calc(x)).toThrow()
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new SparseLayer({})

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([100, 10])
		})

		test('tensor', () => {
			const layer = new SparseLayer({})

			const x = Tensor.randn([15, 10, 7])
			expect(() => layer.calc(x)).toThrow()
		})
	})

	test('toObject', () => {
		const layer = new SparseLayer({ rho: 0.1, beta: 0.9 })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'sparsity', rho: 0.1, beta: 0.9 })
	})

	test('fromObject', () => {
		const layer = SparseLayer.fromObject({ type: 'sparsity', rho: 0.1, beta: 0.9 })
		expect(layer).toBeInstanceOf(SparseLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'sparsity' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j))
			}
		}
	})

	test.skip('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'sparsity', rho: 0.02, beta: 1 }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.randn(1, 3)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			console.log(loss)
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
