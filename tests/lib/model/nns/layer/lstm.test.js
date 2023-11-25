import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import LSTMLayer from '../../../../../lib/model/nns/layer/lstm.js'

describe('layer', () => {
	describe('construct', () => {
		test('default', () => {
			const layer = new LSTMLayer({ size: 4 })
			expect(layer).toBeDefined()
		})

		test('invalid sequence', () => {
			expect(() => new LSTMLayer({ size: 4, sequence_dim: 2 })).toThrow('Invalid sequence dimension')
		})
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new LSTMLayer({ size: 4 })

			const x = Matrix.randn(10, 3)
			expect(() => layer.calc(x)).toThrow()
		})

		test('tensor', () => {
			const layer = new LSTMLayer({ size: 4 })

			const x = Tensor.randn([10, 7, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 4])
		})

		test('tensor return sequence', () => {
			const layer = new LSTMLayer({ size: 4, return_sequences: true })

			const x = Tensor.randn([10, 7, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 7, 4])
		})

		test('tensor sequence_dim: 0', () => {
			const layer = new LSTMLayer({ size: 4, sequence_dim: 0 })

			const x = Tensor.randn([7, 10, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 4])
		})
	})

	describe('grad', () => {
		test('no sequence', () => {
			const layer = new LSTMLayer({ size: 4 })

			const x = Tensor.randn([10, 7, 5])
			layer.calc(x)

			const bo = Matrix.ones(10, 4)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 7, 5])
		})

		test('sequence', () => {
			const layer = new LSTMLayer({ size: 4, return_sequences: true })

			const x = Tensor.randn([10, 7, 5])
			layer.calc(x)

			const bo = Tensor.ones([10, 7, 4])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 7, 5])
		})

		test('sequence_dim: 0', () => {
			const layer = new LSTMLayer({ size: 4, sequence_dim: 0 })

			const x = Tensor.randn([7, 10, 5])
			layer.calc(x)

			const bo = Matrix.ones(10, 4)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([7, 10, 5])
		})
	})

	test('toObject', () => {
		const layer = new LSTMLayer({ size: 4 })

		const obj = layer.toObject()
		expect(obj.type).toBe('lstm')
		expect(obj.return_sequences).toBeFalsy()
		expect(obj.size).toBe(4)
	})

	test('fromObject', () => {
		const orglayer = new LSTMLayer({ size: 4 })
		orglayer.calc(Tensor.randn([10, 7, 5]))
		const layer = LSTMLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(LSTMLayer)
	})
})

describe('nn', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'lstm', size: 4 }], 'mse', 'adam')
		const x = Tensor.random([1, 7, 5], -0.1, 0.1)
		const t = Matrix.random(1, 4, -0.8, 0.8)

		for (let i = 0; i < 1000; i++) {
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

	test('string parameters', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'variable', value: Matrix.randn(5, 3), name: 'w_z' },
				{ type: 'variable', value: Matrix.randn(5, 3), name: 'w_in' },
				{ type: 'variable', value: Matrix.randn(5, 3), name: 'w_for' },
				{ type: 'variable', value: Matrix.randn(5, 3), name: 'w_out' },
				{ type: 'variable', value: Matrix.randn(3, 3), name: 'r_z' },
				{ type: 'variable', value: Matrix.randn(3, 3), name: 'r_in' },
				{ type: 'variable', value: Matrix.randn(3, 3), name: 'r_for' },
				{ type: 'variable', value: Matrix.randn(3, 3), name: 'r_out' },
				{ type: 'variable', value: Matrix.randn(1, 3), name: 'p_in' },
				{ type: 'variable', value: Matrix.randn(1, 3), name: 'p_for' },
				{ type: 'variable', value: Matrix.randn(1, 3), name: 'p_out' },
				{ type: 'variable', value: Matrix.randn(1, 3), name: 'b_z' },
				{ type: 'variable', value: Matrix.randn(1, 3), name: 'b_in' },
				{ type: 'variable', value: Matrix.randn(1, 3), name: 'b_for' },
				{ type: 'variable', value: Matrix.randn(1, 3), name: 'b_out' },
				{
					type: 'lstm',
					size: 3,
					w_z: 'w_z',
					w_in: 'w_in',
					w_for: 'w_for',
					w_out: 'w_out',
					r_z: 'r_z',
					r_in: 'r_in',
					r_for: 'r_for',
					r_out: 'r_out',
					p_in: 'p_in',
					p_for: 'p_for',
					p_out: 'p_out',
					b_z: 'b_z',
					b_in: 'b_in',
					b_for: 'b_for',
					b_out: 'b_out',
					input: 'in',
				},
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
