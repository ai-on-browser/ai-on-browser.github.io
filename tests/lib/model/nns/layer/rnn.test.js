import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import RNNLayer from '../../../../../lib/model/nns/layer/rnn.js'

describe('layer', () => {
	describe('construct', () => {
		test('default', () => {
			const layer = new RNNLayer({ size: 4 })
			expect(layer).toBeDefined()
		})

		test('invalid sequence', () => {
			expect(() => new RNNLayer({ size: 4, sequence_dim: 2 })).toThrow('Invalid sequence dimension')
		})
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new RNNLayer({ size: 4 })

			const x = Matrix.randn(10, 3)
			expect(() => layer.calc(x)).toThrow()
		})

		test('tensor', () => {
			const layer = new RNNLayer({ size: 4 })

			const x = Tensor.randn([10, 7, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 4])
		})

		test('tensor return sequence', () => {
			const layer = new RNNLayer({ size: 4, return_sequences: true })

			const x = Tensor.randn([10, 7, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 7, 4])
		})

		test('tensor sequence_dim: 0', () => {
			const layer = new RNNLayer({ size: 4, sequence_dim: 0 })

			const x = Tensor.randn([7, 10, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 4])
		})

		test('tensor return sequence sequence_dim: 0', () => {
			const layer = new RNNLayer({ size: 4, return_sequences: true, sequence_dim: 0 })

			const x = Tensor.randn([7, 10, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([7, 10, 4])
		})

		test('tensor no activation', () => {
			const layer = new RNNLayer({ size: 4, activation: null })

			const x = Tensor.randn([10, 7, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 4])
		})

		test('tensor object activation', () => {
			const layer = new RNNLayer({ size: 4, activation: { type: 'sigmoid' } })

			const x = Tensor.randn([10, 7, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 4])
		})
	})

	describe('grad', () => {
		test('no sequence', () => {
			const layer = new RNNLayer({ size: 4 })

			const x = Tensor.randn([10, 7, 5])
			layer.calc(x)

			const bo = Matrix.ones(10, 4)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 7, 5])
		})

		test('sequence', () => {
			const layer = new RNNLayer({ size: 4, return_sequences: true })

			const x = Tensor.randn([10, 7, 5])
			layer.calc(x)

			const bo = Tensor.ones([10, 7, 4])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 7, 5])
		})

		test('sequence_dim: 0', () => {
			const layer = new RNNLayer({ size: 4, sequence_dim: 0 })

			const x = Tensor.randn([7, 10, 5])
			layer.calc(x)

			const bo = Matrix.ones(10, 4)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([7, 10, 5])
		})

		test('return_sequences sequence_dim: 0', () => {
			const layer = new RNNLayer({ size: 4, return_sequences: true, sequence_dim: 0 })

			const x = Tensor.randn([7, 10, 5])
			layer.calc(x)

			const bo = Tensor.ones([7, 10, 4])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([7, 10, 5])
		})

		test('no activation', () => {
			const layer = new RNNLayer({ size: 4, activation: null })

			const x = Tensor.randn([10, 7, 5])
			layer.calc(x)

			const bo = Matrix.ones(10, 4)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 7, 5])
		})

		test('object activation', () => {
			const layer = new RNNLayer({ size: 4, activation: { type: 'sigmoid' } })

			const x = Tensor.randn([10, 7, 5])
			layer.calc(x)

			const bo = Matrix.ones(10, 4)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 7, 5])
		})
	})

	describe('toObject', () => {
		test('default', () => {
			const layer = new RNNLayer({ size: 4 })

			const obj = layer.toObject()
			expect(obj.type).toBe('rnn')
			expect(obj.return_sequences).toBeFalsy()
			expect(obj.size).toBe(4)
		})

		test('string parameters', () => {
			const layer = new RNNLayer({ size: 4, w_x: 'w_x' })

			const obj = layer.toObject()
			expect(obj.type).toBe('rnn')
			expect(obj.return_sequences).toBeFalsy()
			expect(obj.size).toBe(4)
			expect(obj.w_x).toBe('w_x')
		})
	})

	test('fromObject', () => {
		const orglayer = new RNNLayer({ size: 4 })
		orglayer.calc(Tensor.randn([10, 7, 5]))
		const layer = RNNLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(RNNLayer)
	})
})

describe('nn', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'rnn', size: 4 }], 'mse', 'adam')
		const x = Tensor.randn([1, 10, 6])
		const t = Matrix.random(1, 4, -0.9, 0.9)

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

	test('string parameters', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'variable', value: Matrix.randn(5, 3), name: 'w_x' },
				{ type: 'variable', value: Matrix.randn(3, 3), name: 'w_h' },
				{ type: 'variable', value: Matrix.randn(1, 3), name: 'b_x' },
				{ type: 'variable', value: Matrix.randn(1, 3), name: 'b_h' },
				{ type: 'rnn', size: 3, w_x: 'w_x', w_h: 'w_h', b_x: 'b_x', b_h: 'b_h', input: 'in' },
			],
			'mse',
			'adam'
		)
		const x = Tensor.random([1, 4, 5], -0.1, 0.1)
		const t = Matrix.random(1, 3, -0.8, 0.8)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 100, 0.01)
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
