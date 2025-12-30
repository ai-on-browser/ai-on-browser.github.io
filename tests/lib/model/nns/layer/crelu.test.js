import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import ConcatenatedReluLayer from '../../../../../lib/model/nns/layer/crelu.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new ConcatenatedReluLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new ConcatenatedReluLayer({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			expect(y.sizes).toEqual([100, 20])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j) >= 0 ? x.at(i, j) : 0)
					expect(y.at(i, j + x.cols)).toBeCloseTo(x.at(i, j) <= 0 ? -x.at(i, j) : 0)
				}
			}
		})

		test('tensor', () => {
			const layer = new ConcatenatedReluLayer({})

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([15, 10, 14])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(x.at(i, j, k) >= 0 ? x.at(i, j, k) : 0)
						expect(y.at(i, j, k + x.sizes[2])).toBeCloseTo(x.at(i, j, k) <= 0 ? -x.at(i, j, k) : 0)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new ConcatenatedReluLayer({})

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.randn(100, 20)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([100, 10])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(x.at(i, j) >= 0 ? bo.at(i, j) : -bo.at(i, j + x.cols))
				}
			}
		})

		test('tensor', () => {
			const layer = new ConcatenatedReluLayer({})

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 14])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([15, 10, 7])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) >= 0 ? bo.at(i, j, k) : -bo.at(i, j, k + x.sizes[2])
						)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new ConcatenatedReluLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'crelu' })
	})

	test('fromObject', () => {
		const layer = ConcatenatedReluLayer.fromObject({ type: 'crelu' })
		expect(layer).toBeInstanceOf(ConcatenatedReluLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'crelu' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([10, 20])
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) >= 0 ? x.at(i, j) : 0)
				expect(y.at(i, j + x.cols)).toBeCloseTo(x.at(i, j) <= 0 ? -x.at(i, j) : 0)
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3 },
				{ type: 'crelu' },
				{ type: 'reshape', size: [2, 3] },
				{ type: 'sum', axis: 1 },
				{ type: 'flatten' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, 0, 5)

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
