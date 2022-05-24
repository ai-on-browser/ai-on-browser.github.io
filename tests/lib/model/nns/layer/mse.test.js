import Matrix from '../../../../../lib/util/matrix.js'

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import MSELayer from '../../../../../lib/model/nns/layer/mse.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new MSELayer({})
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new MSELayer({})

		const x = Matrix.randn(100, 10)
		const t = Matrix.randn(100, 10)
		layer.bind({ supervisor: t })
		const y = layer.calc(x)
		x.sub(t)
		x.mult(x)
		expect(y.sizes).toEqual([1, 1])
		expect(y.at(0, 0)).toBeCloseTo(x.mean())
	})

	test('grad', () => {
		const layer = new MSELayer({})

		const x = Matrix.randn(100, 10)
		const t = Matrix.randn(100, 10)
		layer.bind({ supervisor: t })
		layer.calc(x)

		const bi = layer.grad()
		expect(bi.sizes).toEqual([100, 10])
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(bi.at(i, j)).toBe((x.at(i, j) - t.at(i, j)) / 2)
			}
		}
	})

	test('toObject', () => {
		const layer = new MSELayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'mse' })
	})

	test('fromObject', () => {
		const layer = MSELayer.fromObject({ type: 'mse' })
		expect(layer).toBeInstanceOf(MSELayer)
	})
})
