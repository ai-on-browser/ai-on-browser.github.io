import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import TransposeLayer from '../../../../../lib/model/nns/layer/transpose.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new TransposeLayer({ axis: [1, 0] })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new TransposeLayer({ axis: [1, 0] })

			const x = Matrix.randn(20, 10)
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 20])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(j, i)).toBeCloseTo(x.at(i, j))
				}
			}
		})

		test('tensor', () => {
			const layer = new TransposeLayer({ axis: [2, 1, 0] })

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([7, 10, 15])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(k, j, i)).toBeCloseTo(x.at(i, j, k))
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new TransposeLayer({ axis: [1, 0] })

			const x = Matrix.randn(20, 10)
			layer.calc(x)

			const bo = Matrix.ones(10, 20)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([20, 10])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBe(1)
				}
			}
		})

		test('tensor', () => {
			const layer = new TransposeLayer({ axis: [2, 1, 0] })

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([7, 10, 15])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([15, 10, 7])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBe(1)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new TransposeLayer({ axis: [1, 0] })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'transpose', axis: [1, 0] })
	})

	test('fromObject', () => {
		const layer = TransposeLayer.fromObject({ type: 'transpose', axis: [1, 0] })
		expect(layer).toBeInstanceOf(TransposeLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'transpose', axis: [1, 0] }])
		const x = Matrix.randn(20, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.cols; i++) {
			for (let j = 0; j < x.rows; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(j, i))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'transpose', axis: [1, 0] }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.randn(3, 1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.rows; i++) {
			expect(y.at(i, 0)).toBeCloseTo(t.at(i, 0))
		}
	})
})
