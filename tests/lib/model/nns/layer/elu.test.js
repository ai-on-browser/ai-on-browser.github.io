import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import ELULayer from '../../../../../lib/model/nns/layer/elu.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new ELULayer({})
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new ELULayer({})

		const x = Matrix.randn(100, 10)
		const y = layer.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) > 0 ? x.at(i, j) : Math.exp(x.at(i, j)) - 1)
			}
		}
	})

	test('grad', () => {
		const layer = new ELULayer({})

		const x = Matrix.randn(100, 10)
		const y = layer.calc(x)

		const bo = Matrix.ones(100, 10)
		const bi = layer.grad(bo)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(bi.at(i, j)).toBeCloseTo(x.at(i, j) > 0 ? 1 : Math.exp(y.at(i, j)))
			}
		}
	})

	test('toObject', () => {
		const layer = new ELULayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'elu', a: 1 })
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'elu' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) > 0 ? x.at(i, j) : Math.exp(x.at(i, j)) - 1)
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'elu' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, -0.5, 1)

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
