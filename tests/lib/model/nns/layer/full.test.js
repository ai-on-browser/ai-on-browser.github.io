import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import FullLayer from '../../../../../lib/model/nns/layer/full.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new FullLayer({ out_size: 2 })
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new FullLayer({ out_size: 4 })

		const x = Matrix.randn(100, 10)
		const y = layer.calc(x)
		expect(y.sizes).toEqual([100, 4])
	})

	test('grad', () => {
		const layer = new FullLayer({ out_size: 4 })

		const x = Matrix.randn(100, 10)
		layer.calc(x)

		const bo = Matrix.ones(100, 4)
		const bi = layer.grad(bo)
		expect(bi.sizes).toEqual([100, 10])
	})

	test('toObject', () => {
		const layer = new FullLayer({ out_size: 4 })

		const obj = layer.toObject()
		expect(obj.type).toBe('full')
		expect(obj.activation).toBeNull()
		expect(obj.l1_decay).toBe(0)
		expect(obj.l2_decay).toBe(0)
		expect(obj.out_size).toBe(4)
		expect(obj.b).toHaveLength(1)
		expect(obj.b[0]).toHaveLength(4)
	})
})

describe('nn', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'full', out_size: 5, activation: 'sigmoid' },
				{ type: 'full', out_size: 3 },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 10)
		const t = Matrix.randn(1, 3)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < 3; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('update decay', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'full', out_size: 5, activation: 'sigmoid', l1_decay: 0.1 },
				{ type: 'full', out_size: 3, l2_decay: 0.2 },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 10)
		const t = Matrix.randn(1, 3)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < 3; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('string out_size', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'full', out_size: 5, activation: 'sigmoid' },
				{ type: 'full', out_size: 'in' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(3, 10)
		const y = net.calc(x)
		expect(y.sizes).toEqual(x.sizes)
	})

	test('toObject', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'full', out_size: 5, activation: 'sigmoid' },
				{ type: 'full', out_size: 3 },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(5, 10)
		net.calc(x)

		const cp = NeuralNetwork.fromObject(net.toObject(), null, 'adam')

		const y = net.calc(x)
		const ycp = cp.calc(x)

		for (let i = 0; i < y.rows; i++) {
			for (let j = 0; j < y.cols; j++) {
				expect(ycp.at(i, j)).toBeCloseTo(y.at(i, j))
			}
		}
	})
})
