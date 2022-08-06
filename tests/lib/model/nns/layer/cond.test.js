import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import CondLayer from '../../../../../lib/model/nns/layer/cond.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new CondLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new CondLayer({})

			const t = Matrix.randn(100, 10)
			const f = Matrix.randn(100, 10)
			const c = Matrix.randn(100, 10)
			c.map(v => v < 0)

			const y = layer.calc(c, t, f)
			for (let i = 0; i < t.rows; i++) {
				for (let j = 0; j < t.cols; j++) {
					expect(y.at(i, j)).toBe(c.at(i, j) ? t.at(i, j) : f.at(i, j))
				}
			}
		})

		test('tensor', () => {
			const layer = new CondLayer({})

			const t = Tensor.randn([100, 20, 10])
			const f = Tensor.randn([100, 20, 10])
			const c = Tensor.randn([100, 20, 10])
			c.map(v => v < 0)

			const y = layer.calc(c, t, f)
			for (let i = 0; i < t.sizes[0]; i++) {
				for (let j = 0; j < t.sizes[1]; j++) {
					for (let k = 0; k < t.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBe(c.at(i, j, k) ? t.at(i, j, k) : f.at(i, j, k))
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new CondLayer({})

			const t = Matrix.randn(100, 10)
			const f = Matrix.randn(100, 10)
			const c = Matrix.randn(100, 10)
			c.map(v => v < 0)
			layer.calc(c, t, f)

			const bo = Matrix.ones(100, 10)
			const [bic, bit, bif] = layer.grad(bo)
			expect(bic).toBeNull()
			for (let i = 0; i < t.rows; i++) {
				for (let j = 0; j < t.cols; j++) {
					expect(bit.at(i, j)).toBe(c.at(i, j) ? 1 : 0)
					expect(bif.at(i, j)).toBe(c.at(i, j) ? 0 : 1)
				}
			}
		})

		test('tensor', () => {
			const layer = new CondLayer({})

			const t = Tensor.randn([100, 20, 10])
			const f = Tensor.randn([100, 20, 10])
			const c = Tensor.randn([100, 20, 10])
			c.map(v => v < 0)
			layer.calc(c, t, f)

			const bo = Tensor.ones([100, 20, 10])
			const [bic, bit, bif] = layer.grad(bo)
			expect(bic).toBeNull()
			for (let i = 0; i < t.sizes[0]; i++) {
				for (let j = 0; j < t.sizes[1]; j++) {
					for (let k = 0; k < t.sizes[2]; k++) {
						expect(bit.at(i, j, k)).toBe(c.at(i, j, k) ? 1 : 0)
						expect(bif.at(i, j, k)).toBe(c.at(i, j, k) ? 0 : 1)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new CondLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'cond' })
	})

	test('fromObject', () => {
		const layer = CondLayer.fromObject({ type: 'cond' })
		expect(layer).toBeInstanceOf(CondLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'c' },
			{ type: 'input', name: 't' },
			{ type: 'input', name: 'f' },
			{ type: 'cond', input: ['c', 't', 'f'] },
		])
		const t = Matrix.randn(10, 10)
		const f = Matrix.randn(10, 10)
		const c = Matrix.randn(10, 10)
		c.map(v => v < 0)

		const y = net.calc({ c, t, f })
		for (let i = 0; i < c.rows; i++) {
			for (let j = 0; j < c.cols; j++) {
				expect(y.at(i, j)).toBe(c.at(i, j) ? t.at(i, j) : f.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 't' },
				{ type: 'full', out_size: 3, name: 'to' },
				{ type: 'input', name: 'f' },
				{ type: 'full', out_size: 3, name: 'fo' },
				{ type: 'input', name: 'c' },
				{ type: 'cond', input: ['c', 'to', 'fo'] },
			],
			'mse',
			'adam'
		)
		const x1 = Matrix.randn(1, 5)
		const x2 = Matrix.randn(1, 5)
		const c = Matrix.randn(1, 3)
		c.map(v => v < 0)
		const t = Matrix.randn(1, 3)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ t: x1, f: x2, c }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ t: x1, f: x2, c })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})
