import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import SoftplusLayer from '../../../../../lib/model/nns/layer/softplus.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new SoftplusLayer({})
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new SoftplusLayer({})

		const x = Matrix.randn(100, 10)
		const y = layer.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.log(1 + Math.exp(x.at(i, j))))
			}
		}
	})

	test('grad', () => {
		const layer = new SoftplusLayer({})

		const x = Matrix.randn(100, 10)
		layer.calc(x)

		const bo = Matrix.ones(100, 10)
		const bi = layer.grad(bo)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(bi.at(i, j)).toBeCloseTo(1 / (1 + Math.exp(x.at(i, j))))
			}
		}
	})

	test('toObject', () => {
		const layer = new SoftplusLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'softplus', beta: 1 })
	})

	test('fromObject', () => {
		const layer = SoftplusLayer.fromObject({ type: 'softplus', beta: 1 })
		expect(layer).toBeInstanceOf(SoftplusLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'softplus' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.log(1 + Math.exp(x.at(i, j))))
			}
		}
	})

	test('calc beta', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'softplus', beta: 10 }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.log(1 + Math.exp(10 * x.at(i, j))) / 10)
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'softplus' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, 0.1, 5)

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

	test('grad beta', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'softplus', beta: 0.1 }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, 0.1, 5)

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
