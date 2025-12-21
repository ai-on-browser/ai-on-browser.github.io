import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import PSFLayer from '../../../../../lib/model/nns/layer/psf.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe.each([undefined, 3])('layer %j', m => {
	test('construct', () => {
		const layer = new PSFLayer({ m })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new PSFLayer({ m })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(1 / (1 + Math.exp(-x.at(i, j))) ** (m ?? 2))
				}
			}
		})

		test('tensor', () => {
			const layer = new PSFLayer({ m })

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(1 / (1 + Math.exp(-x.at(i, j, k))) ** (m ?? 2))
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new PSFLayer({ m })

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					const s = 1 / (1 + Math.exp(-x.at(i, j)))
					expect(bi.at(i, j)).toBeCloseTo((m ?? 2) * s ** ((m ?? 2) - 1) * s * (1 - s))
				}
			}
		})

		test('tensor', () => {
			const layer = new PSFLayer({ m })

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						const s = 1 / (1 + Math.exp(-x.at(i, j, k)))
						expect(bi.at(i, j, k)).toBeCloseTo((m ?? 2) * s ** ((m ?? 2) - 1) * s * (1 - s))
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new PSFLayer({ m })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'psf', m: m ?? 2 })
	})

	test('fromObject', () => {
		const layer = PSFLayer.fromObject({ type: 'psf', m })
		expect(layer).toBeInstanceOf(PSFLayer)
	})
})

describe.each([undefined, 3])('nn %j', m => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'psf', m }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(1 / (1 + Math.exp(-x.at(i, j))) ** (m ?? 2))
			}
		}
	})

	test('grad', { retry: 3 }, () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'psf', m }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, 0.1, 0.8)

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
