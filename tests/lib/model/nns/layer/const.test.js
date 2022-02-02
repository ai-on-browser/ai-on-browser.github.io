import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import ConstLayer from '../../../../../lib/model/nns/layer/const.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new ConstLayer({ value: 1 })
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new ConstLayer({ value: 1 })

		const y = layer.calc()
		expect(y.sizes).toEqual([1, 1])
		expect(y.at(0, 0)).toBe(1)
	})

	test('grad', () => {
		const layer = new ConstLayer({ value: 1 })

		layer.calc()

		const bo = Matrix.ones(1, 1)
		const bi = layer.grad(bo)
		expect(bi).toBeUndefined()
	})

	test('toObject', () => {
		const layer = new ConstLayer({ value: 1 })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'const', value: 1 })
	})
})

describe('nn', () => {
	test('scalar', () => {
		const net = NeuralNetwork.fromObject([{ type: 'const', value: 1 }])
		const y = net.calc([])
		expect(y.sizes).toEqual([1, 1])
		expect(y.at(0, 0)).toBeCloseTo(1)
	})
})
