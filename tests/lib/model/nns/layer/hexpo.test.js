import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import HexpoLayer from '../../../../../lib/model/nns/layer/hexpo.js'

describe.each([{}, { a: 2, b: 2, c: 2, d: 2 }])('layer %j', opt => {
	test('construct', () => {
		const layer = new HexpoLayer(opt)
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new HexpoLayer(opt)

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(
						x.at(i, j) >= 0
							? -(opt.a ?? 1) * (Math.exp(-x.at(i, j) / (opt.b ?? 1)) - 1)
							: (opt.c ?? 1) * (Math.exp(x.at(i, j) / (opt.d ?? 1)) - 1)
					)
				}
			}
		})

		test('tensor', () => {
			const layer = new HexpoLayer(opt)

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) >= 0
								? -(opt.a ?? 1) * (Math.exp(-x.at(i, j, k) / (opt.b ?? 1)) - 1)
								: (opt.c ?? 1) * (Math.exp(x.at(i, j, k) / (opt.d ?? 1)) - 1)
						)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new HexpoLayer(opt)

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(
						x.at(i, j) >= 0
							? ((opt.a ?? 1) / (opt.b ?? 1)) * Math.exp(-x.at(i, j) / (opt.b ?? 1))
							: ((opt.c ?? 1) / (opt.d ?? 1)) * Math.exp(x.at(i, j) / (opt.d ?? 1))
					)
				}
			}
		})

		test('tensor', () => {
			const layer = new HexpoLayer(opt)

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) >= 0
								? ((opt.a ?? 1) / (opt.b ?? 1)) * Math.exp(-x.at(i, j, k) / (opt.b ?? 1))
								: ((opt.c ?? 1) / (opt.d ?? 1)) * Math.exp(x.at(i, j, k) / (opt.d ?? 1))
						)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new HexpoLayer(opt)

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'hexpo', a: opt.a ?? 1, b: opt.b ?? 1, c: opt.c ?? 1, d: opt.d ?? 1 })
	})

	test('fromObject', () => {
		const layer = HexpoLayer.fromObject({ type: 'hexpo', ...opt })
		expect(layer).toBeInstanceOf(HexpoLayer)
	})
})

describe.each([{}, { a: 2, b: 2, c: 2, d: 2 }])('nn %j', opt => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'hexpo', ...opt }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(
					x.at(i, j) >= 0
						? -(opt.a ?? 1) * (Math.exp(-x.at(i, j) / (opt.b ?? 1)) - 1)
						: (opt.c ?? 1) * (Math.exp(x.at(i, j) / (opt.d ?? 1)) - 1)
				)
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'hexpo', ...opt }],
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
