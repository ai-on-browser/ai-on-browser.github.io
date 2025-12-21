import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import ScaledTanhLayer from '../../../../../lib/model/nns/layer/stanh.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe.each([{}, { a: 1, b: 2 }, { a: 2, b: 1 }])('layer %j', opt => {
	test('construct', () => {
		const layer = new ScaledTanhLayer(opt)
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new ScaledTanhLayer(opt)

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo((opt.a ?? 1) * Math.tanh((opt.b ?? 1) * x.at(i, j)))
				}
			}
		})

		test('tensor', () => {
			const layer = new ScaledTanhLayer(opt)

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo((opt.a ?? 1) * Math.tanh((opt.b ?? 1) * x.at(i, j, k)))
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new ScaledTanhLayer(opt)

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(
						(opt.a ?? 1) * (opt.b ?? 1) - ((opt.b ?? 1) / (opt.a ?? 1)) * y.at(i, j) ** 2
					)
				}
			}
		})

		test('tensor', () => {
			const layer = new ScaledTanhLayer(opt)

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(
							(opt.a ?? 1) * (opt.b ?? 1) - ((opt.b ?? 1) / (opt.a ?? 1)) * y.at(i, j, k) ** 2
						)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new ScaledTanhLayer(opt)

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'stanh', a: opt.a ?? 1, b: opt.b ?? 1 })
	})

	test('fromObject', () => {
		const layer = ScaledTanhLayer.fromObject({ type: 'stanh', ...opt })
		expect(layer).toBeInstanceOf(ScaledTanhLayer)
	})
})

describe.each([{}, { a: 1, b: 2 }, { a: 2, b: 1 }])('nn %j', opt => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'stanh', ...opt }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo((opt.a ?? 1) * Math.tanh((opt.b ?? 1) * x.at(i, j)))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'stanh', ...opt }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
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
