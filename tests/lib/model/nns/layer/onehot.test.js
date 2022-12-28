import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import OnehotLayer from '../../../../../lib/model/nns/layer/onehot.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new OnehotLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new OnehotLayer({})

			const x = Matrix.randn(100, 1)
			x.map(v => Math.floor(v))

			const y = layer.calc(x)
			const idx = []
			for (let i = 0; i < x.rows; i++) {
				if (idx[x.at(i, 0)] === undefined) {
					idx[x.at(i, 0)] = y.row(i).argmax(1).toScaler()
				}
				for (let j = 0; j < y.cols; j++) {
					expect(y.at(i, j)).toBe(idx[x.at(i, 0)] === j ? 1 : 0)
				}
			}
		})

		test('tensor', () => {
			const layer = new OnehotLayer({})

			const x = Tensor.randn([2, 3, 4])
			expect(() => layer.calc(x)).toThrow()
		})
	})

	test('grad', () => {
		const layer = new OnehotLayer({})

		const x = Matrix.randn(100, 1)
		x.map(v => Math.floor(v))
		layer.calc(x)

		const bo = Matrix.ones(100, 10)
		const bi = layer.grad(bo)
		expect(bi).toBeUndefined()
	})

	test('toObject', () => {
		const layer = new OnehotLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'onehot', class_size: null, values: [] })
	})

	test('fromObject', () => {
		const orglayer = new OnehotLayer({})
		const x = Matrix.randn(100, 1)
		x.map(v => Math.floor(v))
		orglayer.calc(x)
		const layer = OnehotLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(OnehotLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'onehot' }])
		const x = Matrix.random(10, 1, 0, 5)
		x.map(v => Math.floor(v))

		const y = net.calc(x)
		const idx = []
		for (let i = 0; i < x.rows; i++) {
			if (idx[x.at(i, 0)] === undefined) {
				idx[x.at(i, 0)] = y.row(i).argmax(1).toScaler()
			}
			for (let j = 0; j < y.cols; j++) {
				expect(y.at(i, j)).toBe(idx[x.at(i, 0)] === j ? 1 : 0)
			}
		}
	})
})
