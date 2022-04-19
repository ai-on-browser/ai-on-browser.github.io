import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import ArgmaxLayer from '../../../../../lib/model/nns/layer/argmax.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new ArgmaxLayer({})
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new ArgmaxLayer({})

		const x = Matrix.randn(100, 10)
		const y = layer.calc(x)
		const t = x.argmax(1)
		for (let i = 0; i < x.rows; i++) {
			expect(y.at(i, 0)).toBeCloseTo(t.at(i, 0))
		}
	})

	test('grad', () => {
		const layer = new ArgmaxLayer({})

		const x = Matrix.randn(100, 10)
		layer.calc(x)

		const bo = Matrix.ones(100, 1)
		const bi = layer.grad(bo)
		expect(bi.sizes).toEqual([100, 10])
	})

	test('toObject', () => {
		const layer = new ArgmaxLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'argmax' })
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'argmax' }])
		const x = Matrix.random(10, 10, 0, 1)

		const y = net.calc(x)
		const t = x.argmax(1)
		for (let i = 0; i < t.rows; i++) {
			for (let j = 0; j < t.cols; j++) {
				expect(y.at(i, j)).toBe(t.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 5 }, { type: 'argmax' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 3, -0.1, 0.1)
		const t = new Matrix(1, 1, Math.floor(Math.random() * 5))

		for (let i = 0; i < 1000; i++) {
			const loss = net.fit(x, t, 100, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.rows; i++) {
			expect(y.at(i, 0)).toBeCloseTo(t.at(i, 0))
		}
	})
})
