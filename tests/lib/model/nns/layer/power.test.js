import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import PowerLayer from '../../../../../lib/model/nns/layer/power.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new PowerLayer({ n: 3 })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new PowerLayer({ n: 3 })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j) ** 3)
				}
			}
		})

		test('tensor', () => {
			const layer = new PowerLayer({ n: 3 })

			const x = Tensor.randn([100, 20, 10])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(x.at(i, j, k) ** 3)
					}
				}
			}
		})

		test('array param', () => {
			const layer = new PowerLayer({ n: Array.from({ length: 10 }, (_, i) => i + 1) })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j) ** (j + 1))
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new PowerLayer({ n: 3 })

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBe(3 * x.at(i, j) ** 2)
				}
			}
		})

		test('tensor', () => {
			const layer = new PowerLayer({ n: 3 })

			const x = Tensor.randn([100, 20, 10])
			layer.calc(x)

			const bo = Tensor.ones([100, 20, 10])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBe(3 * x.at(i, j, k) ** 2)
					}
				}
			}
		})

		test('array param', () => {
			const layer = new PowerLayer({ n: Array.from({ length: 10 }, (_, i) => i + 1) })

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBe((j + 1) * x.at(i, j) ** j)
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new PowerLayer({ n: 3 })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'power', n: 3 })
	})

	test('fromObject', () => {
		const layer = PowerLayer.fromObject({ type: 'power', n: 3 })
		expect(layer).toBeInstanceOf(PowerLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'power', n: 3 }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) ** 3)
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'power', n: 4 }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5, 0, 0.1)
		const t = Matrix.random(1, 3, 0, 2)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.001)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('grad array param', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'power', n: [2, 2, 2] }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5, 0, 0.1)
		const t = Matrix.random(1, 3, 0, 2)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.001)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('grad string param', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3, name: 'w' },
				{ type: 'const', value: new Matrix(1, 3, [2, 2, 2]), name: 'e' },
				{ type: 'power', n: 'e', input: 'w' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5, 0, 0.1)
		const t = Matrix.random(1, 3, 0, 2)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.001)
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
