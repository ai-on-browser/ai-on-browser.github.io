import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import PELULayer from '../../../../../lib/model/nns/layer/pelu.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new PELULayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new PELULayer({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j) >= 0 ? x.at(i, j) : Math.exp(x.at(i, j)) - 1)
				}
			}
		})

		test('tensor', () => {
			const layer = new PELULayer({})

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(
							x.at(i, j, k) >= 0 ? x.at(i, j, k) : Math.exp(x.at(i, j, k)) - 1
						)
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new PELULayer({})

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(x.at(i, j) >= 0 ? 1 : Math.exp(x.at(i, j)))
				}
			}
		})

		test('tensor', () => {
			const layer = new PELULayer({})

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(x.at(i, j, k) >= 0 ? 1 : Math.exp(x.at(i, j, k)))
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new PELULayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'pelu', a: 1, b: 1 })
	})

	test('fromObject', () => {
		const layer = PELULayer.fromObject({ type: 'pelu', a: 1, b: 1 })
		expect(layer).toBeInstanceOf(PELULayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'pelu' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) >= 0 ? x.at(i, j) : Math.exp(x.at(i, j)) - 1)
			}
		}
	})

	test.each([
		[undefined, undefined],
		[-10, -10],
	])('grad a:%j, b:%j', { retry: 5 }, (a, b) => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3, w: Matrix.random(5, 3, -0.1, 0.1), b: Matrix.random(1, 3, -0.1, 0.1) },
				{ type: 'pelu', a, b },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
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
