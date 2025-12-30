import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import EmbeddingLayer from '../../../../../lib/model/nns/layer/embedding.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new EmbeddingLayer({ size: 512 })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new EmbeddingLayer({ size: 512 })

			const x = new Matrix(2, 10, [
				['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
				['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
			])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([2, 10, 512])
		})

		test('tensor 1d', () => {
			const layer = new EmbeddingLayer({ size: 512 })

			const x = new Tensor([2], ['a', 'b'])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([2, 512])
		})

		test('tensor 3d', () => {
			const layer = new EmbeddingLayer({ size: 512 })

			const x = new Tensor([2, 2, 3], ['a', 'b', 'c', 'd', 'e', 'f', 'a', 'b', 'c', 'd', 'e', 'f'])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([2, 2, 3, 512])
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new EmbeddingLayer({ size: 512 })

			const x = new Matrix(2, 10, [
				['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
				['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
			])
			layer.calc(x)

			const bo = Matrix.ones(2, 10, 512)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([2, 10])
		})

		test('tensor', () => {
			const layer = new EmbeddingLayer({ size: 512 })

			const x = new Tensor([2, 2, 3], ['a', 'b', 'c', 'd', 'e', 'f', 'a', 'b', 'c', 'd', 'e', 'f'])
			layer.calc(x)

			const bo = Tensor.ones([2, 2, 3, 512])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([2, 2, 3])
		})
	})

	test('toObject', () => {
		const layer = new EmbeddingLayer({ size: 512 })

		const obj = layer.toObject()
		expect(obj.type).toBe('embedding')
		expect(obj.size).toBe(512)
	})

	test('fromObject', () => {
		const orglayer = new EmbeddingLayer({ size: 512 })
		orglayer.calc(
			new Matrix(2, 10, [
				['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
				['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
			])
		)
		const layer = EmbeddingLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(EmbeddingLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'embedding' }])
		const x = new Matrix(2, 10, [
			['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
			['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
		])

		const y = net.calc(x)
		expect(y.sizes).toEqual([2, 10, 512])
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'embedding', size: 3 }], 'mse', 'adam')
		const x = new Matrix(1, 10, [['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']])
		const t = Tensor.randn([1, 10, 3])

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.sizes[1]; i++) {
			for (let j = 0; j < t.sizes[2]; j++) {
				expect(y.at(0, i, j)).toBeCloseTo(t.at(0, i, j))
			}
		}
	})
})
