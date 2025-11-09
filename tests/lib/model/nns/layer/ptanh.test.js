import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import PenalizedTanhLayer from '../../../../../lib/model/nns/layer/ptanh.js'

describe.each([undefined, 0.1])('layer %j', a => {
	test('construct', () => {
		const layer = new PenalizedTanhLayer({ a })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new PenalizedTanhLayer({ a })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(Math.tanh(x.at(i, j)) * (x.at(i, j) < 0 ? (a ?? 0.25) : 1))
				}
			}
		})

		test('tensor', () => {
			const layer = new PenalizedTanhLayer({ a })

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(
							Math.tanh(x.at(i, j, k)) * (x.at(i, j, k) < 0 ? (a ?? 0.25) : 1)
						)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new PenalizedTanhLayer({ a })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo((1 - y.at(i, j) ** 2) * (x.at(i, j) < 0 ? (a ?? 0.25) : 1))
				}
			}
		})

		test('tensor', () => {
			const layer = new PenalizedTanhLayer({ a })

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(
							(1 - y.at(i, j, k) ** 2) * (x.at(i, j, k) < 0 ? (a ?? 0.25) : 1)
						)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new PenalizedTanhLayer({ a })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'ptanh', a: a ?? 0.25 })
	})

	test('fromObject', () => {
		const layer = PenalizedTanhLayer.fromObject({ type: 'ptanh', a })
		expect(layer).toBeInstanceOf(PenalizedTanhLayer)
	})
})

describe.each([undefined, 0.1])('nn %j', a => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'ptanh', a }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.tanh(x.at(i, j)) * (x.at(i, j) < 0 ? (a ?? 0.25) : 1))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'ptanh', a }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, -(a ?? 0.25) * 0.1, 0.8)

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
