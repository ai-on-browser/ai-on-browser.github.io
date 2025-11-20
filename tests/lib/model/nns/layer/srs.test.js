import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import SoftRootSignLayer from '../../../../../lib/model/nns/layer/srs.js'

describe.each([{}, { alpha: 3, beta: 2 }, { alpha: 5, beta: 3 }])('layer %j', opt => {
	test('construct', () => {
		const layer = new SoftRootSignLayer(opt)
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new SoftRootSignLayer(opt)

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(
						x.at(i, j) / (x.at(i, j) / (opt.alpha ?? 3) + Math.exp(-x.at(i, j) / (opt.beta ?? 2)))
					)
				}
			}
		})

		test('tensor', () => {
			const layer = new SoftRootSignLayer(opt)

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) /
								(x.at(i, j, k) / (opt.alpha ?? 3) + Math.exp(-x.at(i, j, k) / (opt.beta ?? 2)))
						)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new SoftRootSignLayer(opt)

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(
						((1 + x.at(i, j) / (opt.beta ?? 2)) * Math.exp(-x.at(i, j) / (opt.beta ?? 2))) /
							(x.at(i, j) / (opt.alpha ?? 3) + Math.exp(-x.at(i, j) / (opt.beta ?? 2))) ** 2
					)
				}
			}
		})

		test('tensor', () => {
			const layer = new SoftRootSignLayer(opt)

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(
							((1 + x.at(i, j, k) / (opt.beta ?? 2)) * Math.exp(-x.at(i, j, k) / (opt.beta ?? 2))) /
								(x.at(i, j, k) / (opt.alpha ?? 3) + Math.exp(-x.at(i, j, k) / (opt.beta ?? 2))) ** 2
						)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new SoftRootSignLayer(opt)

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'srs', alpha: opt.alpha ?? 3, beta: opt.beta ?? 2 })
	})

	test('fromObject', () => {
		const layer = SoftRootSignLayer.fromObject({ type: 'srs', ...opt })
		expect(layer).toBeInstanceOf(SoftRootSignLayer)
	})
})

describe.each([{}, { alpha: 3, beta: 2 }, { alpha: 5, beta: 3 }])('nn %j', opt => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'srs', ...opt }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(
					x.at(i, j) / (x.at(i, j) / (opt.alpha ?? 3) + Math.exp(-x.at(i, j) / (opt.beta ?? 2)))
				)
			}
		}
	})

	test('grad', { retry: 3 }, () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3, w: new Matrix(5, 3, 0.01) }, { type: 'srs', ...opt }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, 0, 1)

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
