import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import SupervisorLayer from '../../../../../lib/model/nns/layer/supervisor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new SupervisorLayer({})
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new SupervisorLayer({})

		const x = Matrix.randn(10, 10)
		layer.bind({ supervisor: x })
		const y = layer.calc()
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j))
			}
		}
	})

	test('grad', () => {
		const layer = new SupervisorLayer({})

		const bo = Matrix.ones(100, 10)
		const bi = layer.grad(bo)
		expect(bi).toBeUndefined()
	})

	test('toObject', () => {
		const layer = new SupervisorLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'supervisor' })
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'x' },
			{ type: 'supervisor', name: 't' },
			{ type: 'sub', input: ['x', 't'] },
			{ type: 'square' },
			{ type: 'sum' },
		])
		const x = Matrix.randn(10, 10)
		const t = Matrix.randn(10, 10)

		const y = net.calc(x, t)
		expect(y.sizes).toEqual([1, 1])
		expect(y.at(0, 0)).toBeCloseTo(Matrix.map(Matrix.sub(x, t), v => v ** 2).sum())
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'x' },
				{ type: 'full', out_size: 3, name: 'xo' },
				{ type: 'output' },
				{ type: 'supervisor', name: 't' },
				{ type: 'sub', input: ['xo', 't'] },
				{ type: 'square' },
				{ type: 'sum' },
			],
			null,
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.randn(1, 3)

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
