import { expect, jest, test } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import APLLayer from '../../../../../lib/model/nns/layer/apl.js'

describe('layer', () => {
	describe('construct', () => {
		test('default', () => {
			const layer = new APLLayer({})
			expect(layer).toBeDefined()
		})

		test('number', () => {
			const layer = new APLLayer({ a: 2, b: 3 })
			expect(layer).toBeDefined()
		})
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new APLLayer({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					let v = x.at(i, j) >= 0 ? x.at(i, j) : 0
					for (let k = 0; k < 2; k++) {
						v += layer._b[k] - x.at(i, j) >= 0 ? layer._a[k] * (layer._b[k] - x.at(i, j)) : 0
					}
					expect(y.at(i, j)).toBeCloseTo(v)
				}
			}
		})

		test('tensor', () => {
			const layer = new APLLayer({})

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						let v = x.at(i, j, k) >= 0 ? x.at(i, j, k) : 0
						for (let l = 0; l < 2; l++) {
							v += layer._b[l] - x.at(i, j, k) >= 0 ? layer._a[l] * (layer._b[l] - x.at(i, j, k)) : 0
						}
						expect(y.at(i, j, k)).toBeCloseTo(v)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new APLLayer({})

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					let v = x.at(i, j) >= 0 ? 1 : 0
					for (let k = 0; k < 2; k++) {
						v += layer._b[k] - x.at(i, j) >= 0 ? layer._a[k] : 0
					}
					expect(bi.at(i, j)).toBeCloseTo(v)
				}
			}
		})

		test('tensor', () => {
			const layer = new APLLayer({})

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						let v = x.at(i, j, k) >= 0 ? 1 : 0
						for (let l = 0; l < 2; l++) {
							v += layer._b[l] - x.at(i, j, k) >= 0 ? layer._a[l] : 0
						}
						expect(bi.at(i, j, k)).toBeCloseTo(v)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new APLLayer({})

		const obj = layer.toObject()
		const a = obj.a
		obj.a = undefined
		expect(obj).toEqual({ type: 'apl', b: Array(2).fill(0), s: 2 })
		expect(a).toHaveLength(2)
		for (let i = 0; i < a.length; i++) {
			expect(a[i]).toBeGreaterThanOrEqual(0)
			expect(a[i]).toBeLessThan(1)
		}
	})

	test('fromObject', () => {
		const layer = APLLayer.fromObject({ type: 'apl', a: Array(2).fill(0.1), b: Array(2).fill(0), s: 2 })
		expect(layer).toBeInstanceOf(APLLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'apl' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				const layer = net._graph.nodes[1].layer
				let v = x.at(i, j) >= 0 ? x.at(i, j) : 0
				for (let k = 0; k < 2; k++) {
					v += layer._b[k] - x.at(i, j) >= 0 ? layer._a[k] * (layer._b[k] - x.at(i, j)) : 0
				}
				expect(y.at(i, j)).toBeCloseTo(v)
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3, w: Matrix.random(5, 3, 0, 0.1), b: [[-0.1, 0.1, 0]] },
				{ type: 'apl' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, 0, 0.1)
		const t = Matrix.random(1, 3, 0, 3)

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
