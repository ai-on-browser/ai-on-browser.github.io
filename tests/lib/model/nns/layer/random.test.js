import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import RandomLayer from '../../../../../lib/model/nns/layer/random.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new RandomLayer({ size: 5 })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new RandomLayer({ size: 5 })

			const y = layer.calc()
			expect(y.sizes).toEqual([1, 5])
		})

		test('tensor', () => {
			const layer = new RandomLayer({ size: [5, 3] })

			const y = layer.calc()
			expect(y.sizes).toEqual([1, 5, 3])
		})
	})

	test('grad', () => {
		const layer = new RandomLayer({ size: 5 })

		layer.calc()

		const bo = Matrix.ones(1, 5)
		const bi = layer.grad(bo)
		expect(bi).toBeUndefined()
	})

	test('toObject', () => {
		const layer = new RandomLayer({ size: 5 })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'random', size: 5 })
	})

	test('fromObject', () => {
		const layer = RandomLayer.fromObject({ type: 'random', size: 5 })
		expect(layer).toBeInstanceOf(RandomLayer)
	})
})

describe('nn', () => {
	test('scalar', () => {
		const net = NeuralNetwork.fromObject([{ type: 'random', size: 5 }])
		const y1 = net.calc([[]])
		expect(y1.sizes).toEqual([1, 5])
		const y2 = net.calc([[]])
		expect(y2.sizes).toEqual([1, 5])
		for (let i = 0; i < y1.cols; i++) {
			expect(y1.at(0, i)).not.toBe(y2.at(0, i))
		}
	})

	test('name', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'x' },
			{ type: 'random', size: 'x' },
		])
		const x = Matrix.ones(10, 3)

		const y = net.calc(x)
		expect(y.sizes).toEqual(x.sizes)
	})
})
