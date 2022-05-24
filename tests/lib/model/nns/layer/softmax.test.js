import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import SoftmaxLayer from '../../../../../lib/model/nns/layer/softmax.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new SoftmaxLayer({})
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new SoftmaxLayer({})

		const x = Matrix.randn(100, 10)
		const y = layer.calc(x)

		x.map(Math.exp)
		x.div(x.sum(1))
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j))
			}
		}
	})

	test('grad', () => {
		const layer = new SoftmaxLayer({})

		const x = Matrix.randn(100, 10)
		layer.calc(x)

		const bo = Matrix.ones(100, 10)
		const bi = layer.grad(bo)
		expect(bi.sizes).toEqual([100, 10])
	})

	test('toObject', () => {
		const layer = new SoftmaxLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'softmax' })
	})

	test('fromObject', () => {
		const layer = SoftmaxLayer.fromObject({ type: 'softmax' })
		expect(layer).toBeInstanceOf(SoftmaxLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'softmax' }])
		const x = Matrix.random(10, 10, 0, 1)

		const y = net.calc(x)
		const t = Matrix.map(x, Math.exp)
		t.div(t.sum(1))
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(t.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'softmax' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.zeros(1, 3)
		t.set(0, Math.floor(Math.random() * t.cols), 1)

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
