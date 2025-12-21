import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Layer from '../../../../../lib/model/nns/layer/base.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = Layer.fromObject({ type: 'div' })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'div' })

			const x1 = Matrix.randn(100, 10)
			const x2 = Matrix.randn(100, 10)
			const y = layer.calc(x1, x2)
			for (let i = 0; i < x1.rows; i++) {
				for (let j = 0; j < x1.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x1.at(i, j) / x2.at(i, j))
				}
			}
		})

		test('sub matrix', () => {
			const layer = Layer.fromObject({ type: 'div' })

			const x1 = Matrix.randn(100, 10)
			const x2 = Matrix.randn(1, 10)
			const y = layer.calc(x1, x2)
			for (let i = 0; i < x1.rows; i++) {
				for (let j = 0; j < x1.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x1.at(i, j) / x2.at(0, j))
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'div' })

			const x1 = Tensor.randn([15, 10, 7])
			const x2 = Tensor.randn([15, 10, 7])
			const y = layer.calc(x1, x2)
			for (let i = 0; i < x1.sizes[0]; i++) {
				for (let j = 0; j < x1.sizes[1]; j++) {
					for (let k = 0; k < x1.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(x1.at(i, j, k) / x2.at(i, j, k))
					}
				}
			}
		})

		test('sub tensor', () => {
			const layer = Layer.fromObject({ type: 'div' })

			const x1 = Tensor.randn([15, 10, 7])
			const x2 = Tensor.randn([1, 1, 7])
			const y = layer.calc(x1, x2)
			for (let i = 0; i < x1.sizes[0]; i++) {
				for (let j = 0; j < x1.sizes[1]; j++) {
					for (let k = 0; k < x1.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(x1.at(i, j, k) / x2.at(0, 0, k))
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'div' })

			const x1 = Matrix.randn(100, 10)
			const x2 = Matrix.randn(100, 10)
			layer.calc(x1, x2)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			expect(bi).toHaveLength(2)
			expect(bi[0].sizes).toEqual(x1.sizes)
			expect(bi[1].sizes).toEqual(x2.sizes)
			for (let i = 0; i < x1.rows; i++) {
				for (let j = 0; j < x1.cols; j++) {
					expect(bi[0].at(i, j)).toBeCloseTo(1 / x2.at(i, j))
					expect(bi[1].at(i, j)).toBeCloseTo(-x1.at(i, j) / x2.at(i, j) ** 2)
				}
			}
		})

		test('sub matrix', () => {
			const layer = Layer.fromObject({ type: 'div' })

			const x1 = Matrix.randn(100, 10)
			const x2 = Matrix.randn(1, 10)
			layer.calc(x1, x2)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			expect(bi).toHaveLength(2)
			expect(bi[0].sizes).toEqual(x1.sizes)
			expect(bi[1].sizes).toEqual(x2.sizes)
			for (let i = 0; i < x1.rows; i++) {
				for (let j = 0; j < x1.cols; j++) {
					expect(bi[0].at(i, j)).toBeCloseTo(1 / x2.at(0, j))
				}
			}
			const x1sum = x1.sum(0)
			for (let i = 0; i < x2.rows; i++) {
				for (let j = 0; j < x2.cols; j++) {
					expect(bi[1].at(i, j)).toBeCloseTo(-x1sum.at(0, j) / x2.at(i, j) ** 2)
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'div' })

			const x1 = Tensor.randn([15, 10, 7])
			const x2 = Tensor.randn([15, 10, 7])
			layer.calc(x1, x2)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			expect(bi).toHaveLength(2)
			expect(bi[0].sizes).toEqual(x1.sizes)
			expect(bi[1].sizes).toEqual(x2.sizes)
			for (let i = 0; i < x1.sizes[0]; i++) {
				for (let j = 0; j < x1.sizes[1]; j++) {
					for (let k = 0; k < x1.sizes[2]; k++) {
						expect(bi[0].at(i, j, k)).toBeCloseTo(1 / x2.at(i, j, k))
						expect(bi[1].at(i, j, k)).toBeCloseTo(-x1.at(i, j, k) / x2.at(i, j, k) ** 2)
					}
				}
			}
		})

		test('sub tensor', () => {
			const layer = Layer.fromObject({ type: 'div' })

			const x1 = Tensor.randn([15, 10, 7])
			const x2 = Tensor.randn([1, 1, 7])
			layer.calc(x1, x2)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			expect(bi).toHaveLength(2)
			expect(bi[0].sizes).toEqual(x1.sizes)
			expect(bi[1].sizes).toEqual(x2.sizes)
			const x1sum = Array(x1.sizes[2]).fill(0)
			for (let i = 0; i < x1.sizes[0]; i++) {
				for (let j = 0; j < x1.sizes[1]; j++) {
					for (let k = 0; k < x1.sizes[2]; k++) {
						expect(bi[0].at(i, j, k)).toBeCloseTo(1 / x2.at(0, 0, k))
						x1sum[k] += x1.at(i, j, k)
					}
				}
			}
			for (let i = 0; i < x2.sizes[0]; i++) {
				for (let j = 0; j < x2.sizes[1]; j++) {
					for (let k = 0; k < x2.sizes[2]; k++) {
						expect(bi[1].at(i, j, k)).toBeCloseTo(-x1sum[k] / x2.at(i, j, k) ** 2)
					}
				}
			}
		})
	})

	test('grad', () => {
		const layer = Layer.fromObject({ type: 'div' })

		const x1 = Matrix.randn(100, 10)
		const x2 = Matrix.randn(100, 10)
		layer.calc(x1, x2)

		const bo = Matrix.ones(100, 10)
		const bi = layer.grad(bo)
		expect(bi).toHaveLength(2)
		for (let i = 0; i < x1.rows; i++) {
			for (let j = 0; j < x1.cols; j++) {
				expect(bi[0].at(i, j)).toBeCloseTo(1 / x2.at(i, j))
				expect(bi[1].at(i, j)).toBeCloseTo(-x1.at(i, j) / x2.at(i, j) ** 2)
			}
		}
	})

	test('toObject', () => {
		const layer = Layer.fromObject({ type: 'div' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'div' })
	})

	test('fromObject', () => {
		const layer = Layer.fromObject({ type: 'div' })
		expect(layer).toBeDefined()
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'input', name: 'c' },
			{ type: 'div', input: ['a', 'b', 'c'] },
		])
		const a = Matrix.randn(10, 10)
		const b = Matrix.randn(10, 10)
		const c = Matrix.randn(10, 10)

		const y = net.calc({ a, b, c })
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(a.at(i, j) / b.at(i, j) / c.at(i, j))
			}
		}
	})

	test('grad', { retry: 3 }, () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 3, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 3, name: 'bo' },
				{ type: 'input', name: 'c' },
				{ type: 'full', out_size: 3, name: 'co' },
				{ type: 'div', input: ['ao', 'bo', 'co'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(1, 10, 0.1, 0.2)
		b.map(v => (Math.random() < 0 ? -v : v))
		const c = Matrix.random(1, 10, 0.1, 0.2)
		c.map(v => (Math.random() < 0 ? -v : v))
		const t = Matrix.random(1, 3, -0.1, 0.1)

		for (let i = 0; i < 1000; i++) {
			const loss = net.fit({ a, b, c }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b, c })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('grad diff size', { retry: 3 }, () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 4, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 2, name: 'bo' },
				{ type: 'div', input: ['ao', 'bo'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(1, 10, 0.1, 0.2)
		b.map(v => (Math.random() < 0 ? -v : v))
		const t = Matrix.random(1, 4, -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ a, b }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})
