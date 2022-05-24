import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import LessLayer from '../../../../../lib/model/nns/layer/less.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new LessLayer({})
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new LessLayer({})

		const a = Matrix.randn(100, 10)
		const b = Matrix.randn(100, 10)

		const y = layer.calc(a, b)
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBe(a.at(i, j) < b.at(i, j))
			}
		}
	})

	test('toObject', () => {
		const layer = new LessLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'less' })
	})

	test('fromObject', () => {
		const layer = LessLayer.fromObject({ type: 'less' })
		expect(layer).toBeInstanceOf(LessLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'less', input: ['a', 'b'] },
		])
		const a = Matrix.randn(10, 10)
		const b = Matrix.randn(10, 10)

		const y = net.calc({ a, b })
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBe(a.at(i, j) < b.at(i, j))
			}
		}
	})
})
