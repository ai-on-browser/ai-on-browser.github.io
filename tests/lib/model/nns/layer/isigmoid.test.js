import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import ImprovedSigmoidLayer from '../../../../../lib/model/nns/layer/isigmoid.js'

describe.each([{}, { a: 2, alpha: 2 }])('layer %p', opt => {
	test('construct', () => {
		const layer = new ImprovedSigmoidLayer(opt)
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new ImprovedSigmoidLayer(opt)

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(
						x.at(i, j) <= -(opt.a ?? 1)
							? (opt.alpha ?? 1) * (x.at(i, j) + (opt.a ?? 1)) + 1 / (1 + Math.exp(opt.a ?? 1))
							: x.at(i, j) >= (opt.a ?? 1)
								? (opt.alpha ?? 1) * (x.at(i, j) - (opt.a ?? 1)) + 1 / (1 + Math.exp(-(opt.a ?? 1)))
								: 1 / (1 + Math.exp(-x.at(i, j)))
					)
				}
			}
		})

		test('tensor', () => {
			const layer = new ImprovedSigmoidLayer(opt)

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) <= -(opt.a ?? 1)
								? (opt.alpha ?? 1) * (x.at(i, j, k) + (opt.a ?? 1)) + 1 / (1 + Math.exp(opt.a ?? 1))
								: x.at(i, j, k) >= (opt.a ?? 1)
									? (opt.alpha ?? 1) * (x.at(i, j, k) - (opt.a ?? 1)) +
										1 / (1 + Math.exp(-(opt.a ?? 1)))
									: 1 / (1 + Math.exp(-x.at(i, j, k)))
						)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new ImprovedSigmoidLayer(opt)

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(
						x.at(i, j) >= (opt.a ?? 1) || x.at(i, j) <= -(opt.a ?? 1)
							? (opt.alpha ?? 1)
							: y.at(i, j) * (1 - y.at(i, j))
					)
				}
			}
		})

		test('tensor', () => {
			const layer = new ImprovedSigmoidLayer(opt)

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) >= (opt.a ?? 1) || x.at(i, j, k) <= -(opt.a ?? 1)
								? (opt.alpha ?? 1)
								: y.at(i, j, k) * (1 - y.at(i, j, k))
						)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new ImprovedSigmoidLayer(opt)

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'isigmoid', a: opt.a ?? 1, alpha: opt.alpha ?? 1 })
	})

	test('fromObject', () => {
		const layer = ImprovedSigmoidLayer.fromObject({ type: 'isigmoid', ...opt })
		expect(layer).toBeInstanceOf(ImprovedSigmoidLayer)
	})
})

describe.each([{}, { a: 2, alpha: 2 }])('nn %p', opt => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'isigmoid', ...opt }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(
					x.at(i, j) <= -(opt.a ?? 1)
						? (opt.alpha ?? 1) * (x.at(i, j) + (opt.a ?? 1)) + 1 / (1 + Math.exp(opt.a ?? 1))
						: x.at(i, j) >= (opt.a ?? 1)
							? (opt.alpha ?? 1) * (x.at(i, j) - (opt.a ?? 1)) + 1 / (1 + Math.exp(-(opt.a ?? 1)))
							: 1 / (1 + Math.exp(-x.at(i, j)))
				)
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'isigmoid', ...opt }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.randn(1, 3)

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
