import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import ReshapeLayer from '../../../../../lib/model/nns/layer/reshape.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new ReshapeLayer({ size: [4] })
		expect(layer).toBeDefined()
	})

	test('dependentLayers', () => {
		const layer = new ReshapeLayer({ size: 'size' })
		const dl = layer.dependentLayers
		expect(dl.sort()).toEqual(['size'].sort())
	})

	test('calc mat -> mat', () => {
		const layer = new ReshapeLayer({ size: [7] })

		const x = Matrix.randn(10, 7)
		const y = layer.calc(x)
		expect(y).toBeInstanceOf(Matrix)
		expect(y.sizes).toEqual([10, 7])
		for (let i = 0; i < x.length; i++) {
			expect(y.value[i]).toBe(x.value[i])
		}
	})

	test('calc ten -> mat', () => {
		const layer = new ReshapeLayer({ size: [35] })

		const x = Tensor.randn([10, 7, 5])
		const y = layer.calc(x)
		expect(y).toBeInstanceOf(Matrix)
		expect(y.sizes).toEqual([10, 35])
		for (let i = 0; i < x.length; i++) {
			expect(y.value[i]).toBe(x.value[i])
		}
	})

	test('calc mat -> ten', () => {
		const layer = new ReshapeLayer({ size: [7, 5] })

		const x = Matrix.randn(10, 35)
		const y = layer.calc(x)
		expect(y).toBeInstanceOf(Tensor)
		expect(y.sizes).toEqual([10, 7, 5])
		for (let i = 0; i < x.length; i++) {
			expect(y.value[i]).toBe(x.value[i])
		}
	})

	test('calc ten -> ten', () => {
		const layer = new ReshapeLayer({ size: [5, 7] })

		const x = Tensor.randn([10, 7, 5])
		const y = layer.calc(x)
		expect(y).toBeInstanceOf(Tensor)
		expect(y.sizes).toEqual([10, 5, 7])
		for (let i = 0; i < x.length; i++) {
			expect(y.value[i]).toBe(x.value[i])
		}
	})

	test('grad mat -> mat', () => {
		const layer = new ReshapeLayer({ size: [7] })

		const x = Tensor.randn([10, 7])
		layer.calc(x)

		const bo = Matrix.ones(10, 7)
		const bi = layer.grad(bo)
		expect(bi).toBeInstanceOf(Matrix)
		expect(bi.sizes).toEqual([10, 7])
		for (let i = 0; i < x.length; i++) {
			expect(bi.value[i]).toBe(1)
		}
	})

	test('grad ten -> mat', () => {
		const layer = new ReshapeLayer({ size: [35] })

		const x = Tensor.randn([10, 7, 5])
		layer.calc(x)

		const bo = Matrix.ones(10, 35)
		const bi = layer.grad(bo)
		expect(bi).toBeInstanceOf(Tensor)
		expect(bi.sizes).toEqual([10, 7, 5])
		for (let i = 0; i < x.length; i++) {
			expect(bi.value[i]).toBe(1)
		}
	})

	test('grad mat -> ten', () => {
		const layer = new ReshapeLayer({ size: [5, 7] })

		const x = Matrix.randn(10, 35)
		layer.calc(x)

		const bo = Tensor.ones([10, 5, 7])
		const bi = layer.grad(bo)
		expect(bi).toBeInstanceOf(Matrix)
		expect(bi.sizes).toEqual([10, 35])
		for (let i = 0; i < x.length; i++) {
			expect(bi.value[i]).toBe(1)
		}
	})

	test('grad ten -> ten', () => {
		const layer = new ReshapeLayer({ size: [5, 7] })

		const x = Tensor.randn([10, 7, 5])
		layer.calc(x)

		const bo = Tensor.ones([10, 5, 7])
		const bi = layer.grad(bo)
		expect(bi).toBeInstanceOf(Tensor)
		expect(bi.sizes).toEqual([10, 7, 5])
		for (let i = 0; i < x.length; i++) {
			expect(bi.value[i]).toBe(1)
		}
	})

	test('toObject', () => {
		const layer = new ReshapeLayer({ size: [4] })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'reshape', size: [4] })
	})

	test('fromObject', () => {
		const layer = ReshapeLayer.fromObject({ type: 'reshape', size: [4] })
		expect(layer).toBeInstanceOf(ReshapeLayer)
	})
})

describe('nn', () => {
	test('calc mat -> ten', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'reshape', size: [5, 2] }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([10, 5, 2])
		for (let i = 0; i < x.length; i++) {
			expect(y.value[i]).toBeCloseTo(x.value[i])
		}
	})

	test('calc ten -> mat', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'reshape', size: [100] }])
		const x = Tensor.randn([10, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([10, 100])
		for (let i = 0; i < x.length; i++) {
			expect(y.value[i]).toBeCloseTo(x.value[i])
		}
	})

	test('calc ten -> ten', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'reshape', size: [20, 5] }])
		const x = Tensor.randn([10, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([10, 20, 5])
		for (let i = 0; i < x.length; i++) {
			expect(y.value[i]).toBeCloseTo(x.value[i])
		}
	})

	test('string size', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'in' },
			{ type: 'reshape', size: [4, 2] },
			{ type: 'reshape', size: 'in' },
		])
		const x = Matrix.randn(10, 8)

		const y = net.calc(x)
		expect(y.sizes).toEqual(x.sizes)
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'conv', kernel: 2, channel: 3 }, { type: 'reshape', size: [12] }],
			'mse',
			'adam'
		)
		const x = Tensor.randn([1, 3, 3, 2])
		const t = Matrix.random(1, 12, -0.1, 0.1)

		for (let i = 0; i < 1000; i++) {
			const loss = net.fit(x, t, 100, 0.01)
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
