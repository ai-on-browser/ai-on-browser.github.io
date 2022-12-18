import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import RandomizedReluLayer from '../../../../../lib/model/nns/layer/rrelu.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new RandomizedReluLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new RandomizedReluLayer({})
			layer.bind({ training: true })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			const r = []
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					if (x.at(i, j) < 0 && !r[j]) {
						r[j] = y.at(i, j) / x.at(i, j)
					}
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j) * (x.at(i, j) >= 0 ? 1 : r[j]))
				}
			}
		})

		test('tensor', () => {
			const layer = new RandomizedReluLayer({})
			layer.bind({ training: true })

			const x = Tensor.randn([100, 20, 10])
			const y = layer.calc(x)
			const r = []
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					if (!r[j]) {
						r[j] = []
					}
					for (let k = 0; k < x.sizes[2]; k++) {
						if (x.at(i, j, k) < 0 && !r[j][k]) {
							r[j][k] = y.at(i, j, k) / x.at(i, j, k)
						}
						expect(y.at(i, j, k)).toBeCloseTo(x.at(i, j, k) * (x.at(i, j, k) >= 0 ? 1 : r[j][k]))
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new RandomizedReluLayer({})
			layer.bind({ training: true })

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			const r = []
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					if (x.at(i, j) < 0 && !r[j]) {
						r[j] = bi.at(i, j)
					}
					expect(bi.at(i, j)).toBe(x.at(i, j) >= 0 ? 1 : r[j])
				}
			}
		})

		test('tensor', () => {
			const layer = new RandomizedReluLayer({})
			layer.bind({ training: true })

			const x = Tensor.randn([100, 20, 10])
			layer.calc(x)

			const bo = Tensor.ones([100, 20, 10])
			const bi = layer.grad(bo)
			const r = []
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					if (!r[j]) {
						r[j] = []
					}
					for (let k = 0; k < x.sizes[2]; k++) {
						if (x.at(i, j, k) < 0 && !r[j][k]) {
							r[j][k] = bi.at(i, j, k)
						}
						expect(bi.at(i, j, k)).toBe(x.at(i, j, k) >= 0 ? 1 : r[j][k])
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new RandomizedReluLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'rrelu', l: 0.125, u: 1 / 3 })
	})

	test('fromObject', () => {
		const layer = RandomizedReluLayer.fromObject({ type: 'rrelu', l: 0.125, u: 1 / 3 })
		expect(layer).toBeInstanceOf(RandomizedReluLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'rrelu' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		const r = []
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				if (x.at(i, j) < 0 && !r[j]) {
					r[j] = y.at(i, j) / x.at(i, j)
				}
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) * (x.at(i, j) >= 0 ? 1 : r[j]))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'rrelu' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, -1, 1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i), 0.5)
		}
	})
})
