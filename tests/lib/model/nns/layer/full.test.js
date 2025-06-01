import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import FullLayer from '../../../../../lib/model/nns/layer/full.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new FullLayer({ out_size: 2 })
		expect(layer).toBeDefined()
	})

	test('dependentLayers', () => {
		const layer = new FullLayer({ w: 'w', b: 'b', activation: { type: 'clip', min: 'min' } })
		const dl = layer.dependentLayers
		expect(dl.sort()).toEqual(['w', 'b', 'min'].sort())
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new FullLayer({ out_size: 4 })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			expect(y.sizes).toEqual([100, 4])
		})

		test('string activation', () => {
			const layer = new FullLayer({ out_size: 4, activation: 'sigmoid' })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			expect(y.sizes).toEqual([100, 4])
		})

		test('object activation', () => {
			const layer = new FullLayer({ out_size: 4, activation: { type: 'sigmoid' } })

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			expect(y.sizes).toEqual([100, 4])
		})

		test('tensor', () => {
			const layer = new FullLayer({ out_size: 4 })

			const x = Tensor.randn([15, 10, 7])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([15, 10, 4])
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new FullLayer({ out_size: 4 })

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 4)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([100, 10])
		})

		test('string activation', () => {
			const layer = new FullLayer({ out_size: 4, activation: 'sigmoid' })

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 4)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([100, 10])
		})

		test('object activation', () => {
			const layer = new FullLayer({ out_size: 4, activation: { type: 'sigmoid' } })

			const x = Matrix.randn(100, 10)
			layer.calc(x)

			const bo = Matrix.ones(100, 4)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([100, 10])
		})

		test('tensor', () => {
			const layer = new FullLayer({ out_size: 4 })

			const x = Tensor.randn([15, 10, 7])
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 4])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([15, 10, 7])
		})
	})

	test('toObject', () => {
		const layer = new FullLayer({ out_size: 4 })

		const obj = layer.toObject()
		expect(obj.type).toBe('full')
		expect(obj.activation).toBeUndefined()
		expect(obj.l1_decay).toBe(0)
		expect(obj.l2_decay).toBe(0)
		expect(obj.out_size).toBe(4)
	})

	test('fromObject', () => {
		const orglayer = new FullLayer({ out_size: 4 })
		orglayer.calc(Matrix.randn(100, 10))
		const layer = FullLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(FullLayer)
	})
})

describe('nn', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'full', out_size: 5, activation: 'sigmoid' },
				{ type: 'full', out_size: 3 },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 10)
		const t = Matrix.randn(1, 3)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < 3; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('update decay', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'full', out_size: 5, activation: 'sigmoid', l1_decay: 0.1 },
				{ type: 'full', out_size: 3, l2_decay: 0.2 },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 10)
		const t = Matrix.randn(1, 3)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < 3; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('string out_size', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'const', value: [3], name: 'shape' },
				{ type: 'input', name: 'in' },
				{ type: 'full', out_size: 'shape' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 10)
		const t = Matrix.randn(1, 3)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < 3; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('string parameters', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'variable', value: Matrix.randn(10, 3), name: 'w' },
				{ type: 'variable', value: Matrix.randn(1, 3), name: 'b' },
				{ type: 'full', input: 'in', w: 'w', b: 'b' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 10)
		const t = Matrix.randn(1, 3)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < 3; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('toObject', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'full', out_size: 5, activation: 'sigmoid' },
				{ type: 'full', out_size: 3 },
			],
			'mse',
			'adam'
		)
		const x = Matrix.randn(5, 10)
		net.calc(x)

		const cp = NeuralNetwork.fromObject(net.toObject(), null, 'adam')

		const y = net.calc(x)
		const ycp = cp.calc(x)

		for (let i = 0; i < y.rows; i++) {
			for (let j = 0; j < y.cols; j++) {
				expect(ycp.at(i, j)).toBeCloseTo(y.at(i, j))
			}
		}
	})
})
