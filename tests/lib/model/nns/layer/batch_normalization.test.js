import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import BatchNormalizationLayer from '../../../../../lib/model/nns/layer/batch_normalization.js'

describe('layer', () => {
	describe('construct', () => {
		test('default', () => {
			const layer = new BatchNormalizationLayer({})
			expect(layer).toBeDefined()
		})

		test('invalid channel', () => {
			expect(() => new BatchNormalizationLayer({ channel_dim: 2 })).toThrow('Invalid channel dimension')
		})
	})

	describe('calc', () => {
		test('calc', () => {
			const layer = new BatchNormalizationLayer({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)

			const mean = x.mean(0)
			const std = x.std(0)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo((x.at(i, j) - mean.at(0, j)) / std.at(0, j))
				}
			}
		})

		test('calc array', () => {
			const scale = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
			const offset = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
			const input_mean = [1, 3, 5, 7, 9, 2, 4, 6, 8, 10]
			const input_var = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
			const layer = new BatchNormalizationLayer({ scale, offset, input_mean, input_var })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)

			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(
						((x.at(i, j) - input_mean[j]) * scale[j]) / Math.sqrt(input_var[j]) + offset[j]
					)
				}
			}
		})

		test('tensor channel_dim: -1', () => {
			const layer = new BatchNormalizationLayer({})

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)

			for (let k = 0; k < x.sizes[2]; k++) {
				let m = 0
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[1]; j++) {
						m += x.at(i, j, k)
					}
				}
				m /= x.sizes[0] * x.sizes[1]
				let s = 0
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[1]; j++) {
						s += (x.at(i, j, k) - m) ** 2
					}
				}
				s = Math.sqrt(s / (x.sizes[0] * x.sizes[1]))
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let j = 0; j < x.sizes[1]; j++) {
						expect(y.at(i, j, k)).toBeCloseTo((x.at(i, j, k) - m) / s)
					}
				}
			}
		})

		test('tensor channel_dim: 1', () => {
			const layer = new BatchNormalizationLayer({ channel_dim: 1 })

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)

			for (let j = 0; j < x.sizes[1]; j++) {
				let m = 0
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						m += x.at(i, j, k)
					}
				}
				m /= x.sizes[0] * x.sizes[2]
				let s = 0
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						s += (x.at(i, j, k) - m) ** 2
					}
				}
				s = Math.sqrt(s / (x.sizes[0] * x.sizes[2]))
				for (let i = 0; i < x.sizes[0]; i++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo((x.at(i, j, k) - m) / s)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new BatchNormalizationLayer({})

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([100, 10])
		})

		test('tensor channel_dim: -1', () => {
			const layer = new BatchNormalizationLayer({})

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([15, 10, 7])
		})

		test('tensor channel_dim: 1', () => {
			const layer = new BatchNormalizationLayer({ channel_dim: 1 })

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([15, 10, 7])
		})
	})

	test('toObject', () => {
		const layer = new BatchNormalizationLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'batch_normalization', scale: 1, offset: 0, epsilon: 1.0e-12, channel_dim: -1 })
	})

	test('fromObject', () => {
		const layer = BatchNormalizationLayer.fromObject({ type: 'batch_normalization', scale: 1, offset: 0 })
		expect(layer).toBeInstanceOf(BatchNormalizationLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'batch_normalization' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		x.sub(x.mean(0))
		x.div(x.std(0))
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'batch_normalization' }],
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
				{ type: 'full', out_size: 15 },
				{ type: 'reshape', size: [5, 3], name: 'in' },
				{ type: 'variable', value: [1, 1, 1], name: 'scale' },
				{ type: 'variable', value: [0, 0, 0], name: 'offset' },
				{ type: 'batch_normalization', input: 'in', scale: 'scale', offset: 'offset' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Tensor.randn([1, 5, 3])

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < 5; i++) {
			for (let j = 0; j < 3; j++) {
				expect(y.at(0, i, j)).toBeCloseTo(t.at(0, i, j))
			}
		}
	})

	test('string parameters input', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 15 },
				{ type: 'reshape', size: [5, 3], name: 'in' },
				{ type: 'mean', axis: [0, 1], input: 'in', name: 'input_mean' },
				{ type: 'variance', axis: [0, 1], input: 'in', name: 'input_var' },
				{ type: 'batch_normalization', input: 'in', input_mean: 'input_mean', input_var: 'input_var' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Tensor.randn([1, 5, 3])

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < 5; i++) {
			for (let j = 0; j < 3; j++) {
				expect(y.at(0, i, j)).toBeCloseTo(t.at(0, i, j))
			}
		}
	})
})
