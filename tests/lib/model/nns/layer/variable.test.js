import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import VariableLayer from '../../../../../lib/model/nns/layer/variable.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new VariableLayer({ size: [1, 5] })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new VariableLayer({ size: [1, 5] })

			const y = layer.calc()
			expect(y.sizes).toEqual([1, 5])
		})

		test('tensor', () => {
			const layer = new VariableLayer({ size: [1, 3, 5] })

			const y = layer.calc()
			expect(y.sizes).toEqual([1, 3, 5])
		})
	})

	test('grad', () => {
		const layer = new VariableLayer({ size: [1, 5] })

		layer.calc()

		const bo = Matrix.ones(1, 5)
		const bi = layer.grad(bo)
		expect(bi).toBeUndefined()
	})

	test('toObject', () => {
		const layer = new VariableLayer({ size: [1, 5] })

		const obj = layer.toObject()
		expect(obj.type).toBe('variable')
		expect(obj.size).toEqual([1, 5])
		expect(obj.l1_decay).toBe(0)
		expect(obj.l2_decay).toBe(0)
		expect(obj.value).toHaveLength(1)
		expect(obj.value[0]).toHaveLength(5)
	})

	test('fromObject', () => {
		const orglayer = new VariableLayer({ size: [1, 5] })
		const layer = VariableLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(VariableLayer)
	})
})

describe('nn', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'variable', size: [3, 2], name: 'w' },
				{ type: 'variable', size: [1, 2], name: 'b' },
				{ type: 'matmul', input: ['in', 'w'], name: 'a' },
				{ type: 'add', input: ['a', 'b'] },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 3, -0.1, 0.1)
		const t = Matrix.random(1, 2, -0.1, 0.1)

		for (let i = 0; i < 1000; i++) {
			const loss = net.fit(x, t, 100, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < 2; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('update decay', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'variable', size: [3, 2], name: 'w', l1_decay: 0.001 },
				{ type: 'variable', size: [1, 2], name: 'b', l2_decay: 0.01 },
				{ type: 'matmul', input: ['in', 'w'], name: 'a' },
				{ type: 'add', input: ['a', 'b'] },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 3, -0.1, 0.1)
		const t = Matrix.random(1, 2, -0.1, 0.1)

		for (let i = 0; i < 1000; i++) {
			const loss = net.fit(x, t, 100, 0.01)
			if (loss[0] < 1.0e-5) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < 2; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('string matrix parameter', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'variable', size: 'in', name: 'o' },
				{ type: 'add', input: ['in', 'o'] },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 5, -0.1, 0.1)

		for (let i = 0; i < 1000; i++) {
			const loss = net.fit(x, t, 100, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < 5; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('string tensor parameter', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'variable', size: 'in', name: 'o' },
				{ type: 'add', input: ['in', 'o'] },
			],
			'mse',
			'adam'
		)
		const x = Tensor.random([1, 3, 4], -0.1, 0.1)
		const t = Tensor.random([1, 3, 4], -0.1, 0.1)

		for (let i = 0; i < 1000; i++) {
			const loss = net.fit(x, t, 100, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 4; j++) {
				expect(y.at(0, i, j)).toBeCloseTo(t.at(0, i, j))
			}
		}
	})
})
