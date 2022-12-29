import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import RNNLayer from '../../../../../lib/model/nns/layer/rnn.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new RNNLayer({ size: 4 })
		expect(layer).toBeDefined()
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

		test('tensor no activation', () => {
			const layer = new RNNLayer({ size: 4, activation: null })

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

		test('no activation', () => {
			const layer = new RNNLayer({ size: 4, activation: null })

			const x = Tensor.randn([10, 7, 5])
			layer.calc(x)

			const bo = Matrix.ones(10, 4)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 7, 5])
		})
	})

	test('toObject', () => {
		const layer = new RNNLayer({ size: 4 })

		const obj = layer.toObject()
		expect(obj.type).toBe('rnn')
		expect(obj.return_sequences).toBeFalsy()
		expect(obj.size).toBe(4)
		for (let i = 0; i < 4; i++) {
			expect(obj.b_xh[0][i]).toBe(0)
			expect(obj.b_hh[0][i]).toBe(0)
			expect(obj.w_hh[i]).toHaveLength(4)
		}
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
})
