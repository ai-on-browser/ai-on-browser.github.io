import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import Layer from '../../../../../lib/model/nns/layer/base.js'

describe('layer', () => {
	test('construct', () => {
		const layer = Layer.fromObject({ type: 'acosh' })
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = Layer.fromObject({ type: 'acosh' })

		const x = Matrix.random(100, 10, 1, 5)
		const y = layer.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.acosh(x.at(i, j)))
			}
		}
	})

	test('grad', () => {
		const layer = Layer.fromObject({ type: 'acosh' })

		const x = Matrix.random(100, 10, 1, 5)
		layer.calc(x)

		const bo = Matrix.ones(100, 10)
		const bi = layer.grad(bo)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(bi.at(i, j)).toBeCloseTo(1 / (Math.sqrt(x.at(i, j) ** 2 - 1) + 1.0e-4))
			}
		}
	})

	test('toObject', () => {
		const layer = Layer.fromObject({ type: 'acosh' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'acosh' })
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'acosh' }])
		const x = Matrix.random(10, 10, 1, 5)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.acosh(x.at(i, j)))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'clip', min: 1, max: 10 }, { type: 'acosh' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, 0.1, 2)

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
