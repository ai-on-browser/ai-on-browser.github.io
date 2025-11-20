import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import PReLULayer from '../../../../../lib/model/nns/layer/prelu.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new PReLULayer({})
		expect(layer).toBeDefined()
	})

	test('dependentLayers', () => {
		const layer = new PReLULayer({ a: 'a' })
		const dl = layer.dependentLayers
		expect(dl.sort()).toEqual(['a'].sort())
	})

	describe('calc', () => {
		test('matrix input', () => {
			const layer = new PReLULayer({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j) > 0 ? x.at(i, j) : x.at(i, j) * 0.25)
				}
			}
		})

		test('tensor input', () => {
			const layer = new PReLULayer({})

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(x.at(i, j, k) > 0 ? x.at(i, j, k) : x.at(i, j, k) * 0.25)
					}
				}
			}
		})

		test('array param', () => {
			const layer = new PReLULayer({ a: Array.from({ length: 10 }, (_, i) => (i + 1) * 0.1) })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j) > 0 ? x.at(i, j) : x.at(i, j) * (j + 1) * 0.1)
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new PReLULayer({})

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBe(x.at(i, j) > 0 ? 1 : 0.25)
				}
			}
		})

		test('tensor', () => {
			const layer = new PReLULayer({})

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBe(x.at(i, j, k) > 0 ? 1 : 0.25)
					}
				}
			}
		})

		test('array param', () => {
			const layer = new PReLULayer({ a: Array.from({ length: 10 }, (_, i) => (i + 1) * 0.1) })

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBe(x.at(i, j) > 0 ? 1 : (j + 1) * 0.1)
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new PReLULayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'prelu', a: 0.25 })
	})

	test('fromObject', () => {
		const layer = PReLULayer.fromObject({ type: 'prelu', a: 0.25 })
		expect(layer).toBeInstanceOf(PReLULayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'prelu' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) * (x.at(i, j) < 0 ? 0.25 : 1))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'prelu' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, -0.1, 0.1)

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

	test('grad array param', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'prelu', a: Array(3).fill(0.1) }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, -0.1, 0.1)

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

	test('string parameters', { retry: 10 }, () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3, name: 'w' },
				{ type: 'variable', value: Array(3).fill(0.1), name: 'a' },
				{ type: 'prelu', a: 'a', input: 'w' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, -0.1, 0.1)

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
