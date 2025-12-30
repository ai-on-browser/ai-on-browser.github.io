import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import RandomLayer from '../../../../../lib/model/nns/layer/random.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new RandomLayer({ size: 5 })
		expect(layer).toBeDefined()
	})

	test('dependentLayers', () => {
		const layer = new RandomLayer({ size: 'size' })
		const dl = layer.dependentLayers
		expect(dl.sort()).toEqual(['size'].sort())
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
		const x = new Matrix(1, 2, [10, 3])

		const y = net.calc(x)
		expect(y.sizes).toEqual([10, 3])
	})

	test('name tensor', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'x' },
			{ type: 'random', size: 'x' },
		])
		const x = new Tensor([3], [5, 4, 3])

		const y = net.calc(x)
		expect(y.sizes).toEqual([5, 4, 3])
	})
})
