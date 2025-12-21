import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Layer from '../../../../../lib/model/nns/layer/base.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = Layer.fromObject({ type: 'acos' })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'acos' })

			const x = Matrix.random(100, 10, -1, 1)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(Math.acos(x.at(i, j)))
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'acos' })

			const x = Tensor.random([15, 10, 7], -1, 1)
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(Math.acos(x.at(i, j, k)))
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'acos' })

			const x = Matrix.random(100, 10, -1, 1)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(-1 / (Math.sqrt(1 - x.at(i, j) ** 2) + 1.0e-4))
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'acos' })

			const x = Tensor.random([15, 10, 7], -1, 1)
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(-1 / (Math.sqrt(1 - x.at(i, j, k) ** 2) + 1.0e-4))
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = Layer.fromObject({ type: 'acos' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'acos' })
	})

	test('fromObject', () => {
		const layer = Layer.fromObject({ type: 'acos' })
		expect(layer).toBeDefined()
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'acos' }])
		const x = Matrix.random(10, 10, -1, 1)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.acos(x.at(i, j)))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'clip', min: -1, max: 1 }, { type: 'acos' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, 0.1, 3)

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
