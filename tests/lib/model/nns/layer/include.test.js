import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import IncludeLayer from '../../../../../lib/model/nns/layer/include.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new IncludeLayer({ net: [{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'output' }] })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new IncludeLayer({
				net: [{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'output' }],
			})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			expect(y.sizes).toEqual([100, 3])
		})

		test('matrix with input_to', () => {
			const layer = new IncludeLayer({
				net: [
					{ type: 'const', value: 1, size: [1], name: 'c' },
					{ type: 'input', name: 'x' },
					{ type: 'add', input: ['c', 'x'] },
					{ type: 'output' },
				],
				input_to: 'x',
			})
			layer.bind({ input: {} })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			expect(y.sizes).toEqual([100, 10])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBe(x.at(i, j) + 1)
				}
			}
		})

		test('tensor', () => {
			const layer = new IncludeLayer({
				net: [{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'output' }],
			})

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([15, 10, 3])
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new IncludeLayer({
				net: [{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'output' }],
			})

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 3)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([100, 10])
		})

		test('tensor', () => {
			const layer = new IncludeLayer({
				net: [{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'output' }],
			})

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 3])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([15, 10, 7])
		})
	})

	test('toObject', () => {
		const layer = new IncludeLayer({ net: [{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'output' }] })

		const obj = layer.toObject()
		expect(obj.type).toBe('include')
		expect(obj.net).toHaveLength(3)
		expect(obj.input_to).toBeNull()
		expect(obj.train).toBeTruthy()
	})

	test('fromObject', () => {
		const orglayer = new IncludeLayer({
			net: [{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'output' }],
		})
		const layer = IncludeLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(IncludeLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const inc = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'tanh' }])
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'include', net: inc }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.tanh(x.at(i, j)))
			}
		}
	})

	test('grad', () => {
		const inc = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'tanh' }])
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'include', net: inc }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, -0.9, 0.9)

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

	test('grad not train', () => {
		const inc = NeuralNetwork.fromObject([
			{ type: 'input' },
			{ type: 'full', out_size: 3, w: new Matrix(5, 3, 0.01), b: Matrix.zeros(1, 3) },
			{ type: 'tanh' },
		])
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'include', net: inc, train: false }, { type: 'full', out_size: 3 }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, -0.9, 0.9)

		const p1 = inc.calc(x)

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
		const p2 = inc.calc(x)
		for (let i = 0; i < p1.cols; i++) {
			expect(p2.at(0, i)).toBe(p1.at(0, i))
		}
	})
})
