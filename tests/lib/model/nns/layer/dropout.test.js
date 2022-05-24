import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import DropoutLayer from '../../../../../lib/model/nns/layer/dropout.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new DropoutLayer({})
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new DropoutLayer({})

		const x = Matrix.randn(100, 10)
		const y = layer.calc(x)
		for (let i = 0; i < x.rows; i++) {
			let count0 = 0
			for (let j = 0; j < x.cols; j++) {
				if (y.at(i, j) === 0) {
					count0++
				}
			}
			expect(count0).toBe(x.cols / 2)
		}
	})

	test('grad', () => {
		const layer = new DropoutLayer({})

		const x = Matrix.randn(100, 10)
		layer.calc(x)

		const bo = Matrix.ones(100, 10)
		const bi = layer.grad(bo)
		for (let i = 0; i < x.rows; i++) {
			let count0 = 0
			let count1 = 0
			for (let j = 0; j < x.cols; j++) {
				if (bi.at(i, j) === 0) {
					count0++
				} else if (bi.at(i, j) === 1) {
					count1++
				}
			}
			expect(count0).toBe(x.cols / 2)
			expect(count1).toBe(x.cols / 2)
		}
	})

	test('toObject', () => {
		const layer = new DropoutLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'dropout', drop_rate: 0.5 })
	})

	test('fromObject', () => {
		const layer = DropoutLayer.fromObject({ type: 'dropout', drop_rate: 0.5 })
		expect(layer).toBeInstanceOf(DropoutLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'dropout' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			let count0 = 0
			for (let j = 0; j < x.cols; j++) {
				if (y.at(i, j) === 0) {
					count0++
				}
			}
			expect(count0).toBe(x.cols / 2)
		}
	})

	test.skip('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 5 }, { type: 'dropout' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.randn(1, 5)

		for (let i = 0; i < 10; i++) {
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
