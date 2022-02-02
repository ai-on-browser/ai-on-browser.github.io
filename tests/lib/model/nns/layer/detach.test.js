import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import DetachLayer from '../../../../../lib/model/nns/layer/detach.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new DetachLayer({})
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new DetachLayer({})

		const x = Matrix.randn(100, 10)
		const y = layer.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBe(x.at(i, j))
			}
		}
	})

	test('grad', () => {
		const layer = new DetachLayer({})

		const x = Matrix.randn(100, 10)
		layer.calc(x)

		const bo = Matrix.ones(100, 10)
		const bi = layer.grad(bo)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(bi.at(i, j)).toBe(0)
			}
		}
	})

	test('toObject', () => {
		const layer = new DetachLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'detach' })
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'detach' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBe(x.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'detach' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.randn(1, 3)
		const orgy = net.calc(x)

		for (let i = 0; i < 10; i++) {
			net.fit(x, t, 1000, 0.01)
		}

		const y = net.calc(x)
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(orgy.at(0, i))
		}
	})
})
