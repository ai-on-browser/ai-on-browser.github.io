import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import BatchNormalizationLayer from '../../../../../lib/model/nns/layer/batch_normalization.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new BatchNormalizationLayer({})
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new BatchNormalizationLayer({})

		const x = Matrix.randn(100, 10)
		const y = layer.calc(x)

		const mean = x.mean(0)
		const std = x.std(0)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo((x.at(i, j) - mean.at(0, j)) / std.at(0, j))
			}
		}
	})

	test('grad', () => {
		const layer = new BatchNormalizationLayer({})

		const x = Matrix.randn(100, 10)
		layer.calc(x)

		const bo = Matrix.ones(100, 10)
		const bi = layer.grad(bo)
		expect(bi.sizes).toEqual([100, 10])
	})

	test('toObject', () => {
		const layer = new BatchNormalizationLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'batch_normalization', scale: 1, offset: 0 })
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'batch_normalization' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		x.sub(x.mean(0))
		x.div(x.std(0))
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'batch_normalization' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, 0, 1)

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
