import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import AttentionLayer from '../../../../../lib/model/nns/layer/attention.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new AttentionLayer({})
		expect(layer).toBeDefined()
	})

	test('dependentLayers', () => {
		const layer = new AttentionLayer({ wq: 'wq', wk: 'wk', wv: 'wv' })
		const dl = layer.dependentLayers
		expect(dl.sort()).toEqual(['wq', 'wk', 'wv'].sort())
	})

	describe('calc', () => {
		test('tensor', () => {
			const layer = new AttentionLayer({})

			const x = Tensor.randn([5, 10, 7])
			const memory = Tensor.randn([5, 10, 7])
			const y = layer.calc(x, memory)
			expect(y.sizes).toEqual([5, 10, 7])
		})

		test('tensor self', () => {
			const layer = new AttentionLayer({})

			const x = Tensor.randn([5, 10, 7])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([5, 10, 7])
		})

		test('tensor size', () => {
			const layer = new AttentionLayer({ dv: 3 })

			const x = Tensor.randn([5, 10, 7])
			const memory = Tensor.randn([5, 10, 4])
			const y = layer.calc(x, memory)
			expect(y.sizes).toEqual([5, 10, 3])
		})
	})

	describe('grad', () => {
		test('tensor', () => {
			const layer = new AttentionLayer({})

			const x = Tensor.randn([5, 10, 7])
			const memory = Tensor.randn([5, 10, 7])
			layer.calc(x, memory)

			const bo = Tensor.ones([5, 10, 7])
			const bi = layer.grad(bo)
			expect(bi).toHaveLength(2)
			expect(bi[0].sizes).toEqual([5, 10, 7])
			expect(bi[1].sizes).toEqual([5, 10, 7])
		})

		test('tensor self', () => {
			const layer = new AttentionLayer({})

			const x = Tensor.randn([5, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([5, 10, 7])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([5, 10, 7])
		})

		test('tensor size', () => {
			const layer = new AttentionLayer({ dv: 3 })

			const x = Tensor.randn([5, 10, 7])
			const memory = Tensor.randn([5, 10, 4])
			layer.calc(x, memory)

			const bo = Tensor.ones([5, 10, 3])
			const bi = layer.grad(bo)
			expect(bi).toHaveLength(2)
			expect(bi[0].sizes).toEqual([5, 10, 7])
			expect(bi[1].sizes).toEqual([5, 10, 4])
		})
	})

	test('toObject', () => {
		const layer = new AttentionLayer({})

		const obj = layer.toObject()
		expect(obj.type).toBe('attention')
	})

	test('fromObject', () => {
		const orglayer = new AttentionLayer({})
		orglayer.calc(Tensor.randn([5, 10, 7]))
		const layer = AttentionLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(AttentionLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'x' },
			{ type: 'input', name: 'memory' },
			{ type: 'attention', input: ['x', 'memory'] },
		])
		const x = Tensor.randn([5, 10, 12])
		const memory = Tensor.randn([5, 10, 12])

		const y = net.calc({ x, memory })
		expect(y.sizes).toEqual([5, 10, 12])
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'x' },
				{ type: 'input', name: 'memory' },
				{
					type: 'attention',
					input: ['x', 'memory'],
					dk: 4,
					dv: 3,
					wq: Matrix.random(5, 3, -0.1, 0.1),
					wk: Matrix.random(5, 3, -0.1, 0.1),
					wv: Matrix.random(5, 3, -0.1, 0.1),
				},
			],
			'mse',
			'adam'
		)
		const x = Tensor.randn([1, 2, 5])
		const memory = Tensor.randn([1, 2, 5])
		const t = Tensor.random([1, 2, 3], -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ x, memory }, t, 1000, 0.0001)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ x, memory })
		for (let i = 0; i < t.sizes[1]; i++) {
			for (let j = 0; j < t.sizes[2]; j++) {
				expect(y.at(0, i, j)).toBeCloseTo(t.at(0, i, j))
			}
		}
	})

	test('grad self', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'x' },
				{
					type: 'attention',
					dv: 3,
					wq: Matrix.random(5, 3, -0.1, 0.1),
					wk: Matrix.random(5, 3, -0.1, 0.1),
					wv: Matrix.random(5, 3, -0.1, 0.1),
				},
			],
			'mse',
			'adam'
		)
		const x = Tensor.randn([1, 2, 5])
		const t = Tensor.random([1, 2, 3], -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.0001)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.sizes[1]; i++) {
			for (let j = 0; j < t.sizes[2]; j++) {
				expect(y.at(0, i, j)).toBeCloseTo(t.at(0, i, j))
			}
		}
	})

	test('string parameters', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'x' },
				{ type: 'input', name: 'memory' },
				{ type: 'variable', value: Matrix.random(5, 3, -0.1, 0.1), name: 'wq' },
				{ type: 'variable', value: Matrix.random(5, 3, -0.1, 0.1), name: 'wk' },
				{ type: 'variable', value: Matrix.random(5, 3, -0.1, 0.1), name: 'wv' },
				{ type: 'attention', input: ['x', 'memory'], dv: 3, wq: 'wq', wk: 'wk', wv: 'wv' },
			],
			'mse',
			'adam'
		)
		const x = Tensor.randn([1, 2, 5])
		const memory = Tensor.randn([1, 2, 5])
		const t = Tensor.random([1, 2, 3], -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ x, memory }, t, 1000, 0.0001)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ x, memory })
		for (let i = 0; i < t.sizes[1]; i++) {
			for (let j = 0; j < t.sizes[2]; j++) {
				expect(y.at(0, i, j)).toBeCloseTo(t.at(0, i, j))
			}
		}
	})

	test('self string parameters', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'x' },
				{ type: 'variable', value: Matrix.random(5, 3, -0.1, 0.1), name: 'wq' },
				{ type: 'variable', value: Matrix.random(5, 3, -0.1, 0.1), name: 'wk' },
				{ type: 'variable', value: Matrix.random(5, 3, -0.1, 0.1), name: 'wv' },
				{ type: 'attention', input: 'x', dv: 3, wq: 'wq', wk: 'wk', wv: 'wv' },
			],
			'mse',
			'adam'
		)
		const x = Tensor.randn([1, 2, 5])
		const t = Tensor.random([1, 2, 3], -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.0001)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.sizes[1]; i++) {
			for (let j = 0; j < t.sizes[2]; j++) {
				expect(y.at(0, i, j)).toBeCloseTo(t.at(0, i, j))
			}
		}
	})
})
