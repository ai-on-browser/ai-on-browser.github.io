import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import Layer from '../../../../../lib/model/nns/layer/base.js'

describe('layer', () => {
	test('construct', () => {
		const layer = Layer.fromObject({ type: 'power' })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'power' })

			const x = Matrix.random(100, 10, 0, 2)
			const p = Matrix.randn(100, 10)
			const y = layer.calc(x, p)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j) ** p.at(i, j))
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'power' })

			const x = Tensor.random([100, 20, 10], 0, 2)
			const p = Matrix.randn(100, 10)
			const y = layer.calc(x, p)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(x.at(i, j, k) ** p.at(j, k))
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'power' })

			const x = Matrix.random(100, 10, 0, 2)
			const p = Matrix.randn(100, 10)
			layer.calc(x, p)

			const bo = Matrix.ones(100, 10)
			const [xbi, pbi] = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(xbi.at(i, j)).toBe(p.at(i, j) * x.at(i, j) ** (p.at(i, j) - 1))
					expect(pbi.at(i, j)).toBe(x.at(i, j) ** p.at(i, j) * Math.log(x.at(i, j)))
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'power' })

			const x = Tensor.random([100, 20, 10], 0, 2)
			const p = Matrix.randn(20, 10)
			layer.calc(x, p)

			const bo = Tensor.ones([100, 20, 10])
			const [xbi, pbi] = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(xbi.at(i, j, k)).toBe(p.at(j, k) * x.at(i, j, k) ** (p.at(j, k) - 1))
					}
				}
			}
			for (let j = 0; j < x.sizes[1]; j++) {
				for (let k = 0; k < x.sizes[2]; k++) {
					let v = 0
					for (let i = 0; i < x.sizes[0]; i++) {
						v += x.at(i, j, k) ** p.at(j, k) * Math.log(x.at(i, j, k))
					}
					expect(pbi.at(j, k)).toBe(v)
				}
			}
		})
	})

	test('toObject', () => {
		const layer = Layer.fromObject({ type: 'power' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'power' })
	})

	test('fromObject', () => {
		const layer = Layer.fromObject({ type: 'power' })
		expect(layer).toBeDefined()
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'x' },
			{ type: 'input', name: 'p' },
			{ type: 'power', input: ['x', 'p'] },
		])
		const x = Matrix.random(10, 10, 0, 5)
		const p = Matrix.randn(10, 10)

		const y = net.calc({ x, p })
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) ** p.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3, name: 'w' }, { type: 'power', input: ['w', 4] }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5, 0, 0.1)
		const t = Matrix.random(1, 3, 0, 2)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.001)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('grad exp', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'variable', value: Matrix.randn(1, 5), name: 'e' },
				{ type: 'power', input: ['in', 'e'] },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, 0, 2)
		const t = Matrix.random(1, 5, 0, 2)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.001)
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
