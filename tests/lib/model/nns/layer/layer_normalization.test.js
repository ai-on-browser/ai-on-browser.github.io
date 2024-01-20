import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import LayerNormalizationLayer from '../../../../../lib/model/nns/layer/layer_normalization.js'

describe('layer', () => {
	describe('construct', () => {
		test('default', () => {
			const layer = new LayerNormalizationLayer({})
			expect(layer).toBeDefined()
		})
	})

	test('properties', () => {
		const layer = new LayerNormalizationLayer({})

		const x = Matrix.randn(100, 10)
		layer.calc(x)

		const mean = x.mean(1)
		expect(layer.mean.sizes).toEqual([100, 1])
		for (let i = 0; i < x.rows; i++) {
			expect(layer.mean.at(i, 0)).toBeCloseTo(mean.at(i, 0))
		}
		const std = x.std(1)
		expect(layer.invStdDev.sizes).toEqual([100, 1])
		for (let i = 0; i < x.rows; i++) {
			expect(layer.invStdDev.at(i, 0)).toBeCloseTo(1 / std.at(i, 0))
		}
	})

	describe('calc', () => {
		test('calc', () => {
			const layer = new LayerNormalizationLayer({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)

			const mean = x.mean(1)
			const std = x.std(1)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo((x.at(i, j) - mean.at(i, 0)) / std.at(i, 0))
				}
			}
		})

		test('calc array', () => {
			const scale = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
			const offset = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
			const layer = new LayerNormalizationLayer({ scale, offset })

			const x = Matrix.randn(12, 10)
			const y = layer.calc(x)

			const mean = x.mean(1)
			const std = x.std(1)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(((x.at(i, j) - mean.at(i, 0)) * scale[j]) / std.at(i, 0) + offset[j])
				}
			}
		})

		test('tensor', () => {
			const layer = new LayerNormalizationLayer({})

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)

			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					let m = 0
					for (let k = 0; k < x.sizes[2]; k++) {
						m += x.at(i, j, k)
					}
					m /= x.sizes[2]
					let s = 0
					for (let k = 0; k < x.sizes[2]; k++) {
						s += (x.at(i, j, k) - m) ** 2
					}
					s = Math.sqrt(s / x.sizes[2])
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo((x.at(i, j, k) - m) / s)
					}
				}
			}
		})

		test('tensor axis: 1', () => {
			const layer = new LayerNormalizationLayer({ axis: 1 })

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)

			for (let i = 0; i < x.sizes[0]; i++) {
				let m = 0
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						m += x.at(i, j, k)
					}
				}
				m /= x.sizes[1] * x.sizes[2]
				let s = 0
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						s += (x.at(i, j, k) - m) ** 2
					}
				}
				s = Math.sqrt(s / (x.sizes[1] * x.sizes[2]))
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo((x.at(i, j, k) - m) / s)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new LayerNormalizationLayer({})

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([100, 10])
		})

		test('tensor', () => {
			const layer = new LayerNormalizationLayer({})

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([15, 10, 7])
		})

		test('tensor axis: 1', () => {
			const layer = new LayerNormalizationLayer({ axis: 1 })

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([15, 10, 7])
		})
	})

	test('toObject', () => {
		const layer = new LayerNormalizationLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'layer_normalization', scale: 1, offset: 0, epsilon: 1.0e-12, axis: -1 })
	})

	test('fromObject', () => {
		const layer = LayerNormalizationLayer.fromObject({ type: 'layer_normalization', scale: 1, offset: 0 })
		expect(layer).toBeInstanceOf(LayerNormalizationLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'layer_normalization' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		x.sub(x.mean(1))
		x.div(x.std(1))
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j))
			}
		}
	})

	test.each([undefined, 1])('grad axis: %p', axis => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'layer_normalization', axis }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, 0, 1)

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

	test('string parameters', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 7 },
				{ type: 'reshape', size: [1, 7], name: 'in' },
				{ type: 'variable', value: [1, 1, 1, 1, 1, 1, 1], name: 'scale' },
				{ type: 'variable', value: [0, 0, 0, 0, 0, 0, 0], name: 'offset' },
				{ type: 'layer_normalization', input: 'in', scale: 'scale', offset: 'offset' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Tensor.randn([1, 1, 7])

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < 1; i++) {
			for (let j = 0; j < 7; j++) {
				expect(y.at(0, i, j)).toBeCloseTo(t.at(0, i, j))
			}
		}
	})
})
