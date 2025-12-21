import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import SupervisorLayer from '../../../../../lib/model/nns/layer/supervisor.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new SupervisorLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('array 2d', () => {
			const layer = new SupervisorLayer({})

			const x = Matrix.randn(10, 10).toArray()
			layer.bind({ supervisor: x })
			const y = layer.calc()
			for (let i = 0; i < x.length; i++) {
				for (let j = 0; j < x[i].length; j++) {
					expect(y.at(i, j)).toBeCloseTo(x[i][j])
				}
			}
		})

		test('array 3d', () => {
			const layer = new SupervisorLayer({})

			const x = Tensor.randn([15, 10, 7]).toArray()
			layer.bind({ supervisor: x })
			const y = layer.calc()
			for (let i = 0; i < x.length; i++) {
				for (let j = 0; j < x[i].length; j++) {
					for (let k = 0; k < x[i][j].length; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(x[i][j][k])
					}
				}
			}
		})

		test('matrix', () => {
			const layer = new SupervisorLayer({})

			const x = Matrix.randn(10, 10)
			layer.bind({ supervisor: x })
			const y = layer.calc()
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j))
				}
			}
		})

		test('tensor', () => {
			const layer = new SupervisorLayer({})

			const x = Tensor.randn([15, 10, 7])
			layer.bind({ supervisor: x })
			const y = layer.calc()
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(x.at(i, j, k))
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new SupervisorLayer({})

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			expect(bi).toBeUndefined()
		})

		test('tensor', () => {
			const layer = new SupervisorLayer({})

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			expect(bi).toBeUndefined()
		})
	})

	test('toObject', () => {
		const layer = new SupervisorLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'supervisor' })
	})

	test('fromObject', () => {
		const layer = SupervisorLayer.fromObject({ type: 'supervisor' })
		expect(layer).toBeInstanceOf(SupervisorLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'x' },
			{ type: 'supervisor', name: 't' },
			{ type: 'sub', input: ['x', 't'] },
			{ type: 'square' },
			{ type: 'sum' },
		])
		const x = Matrix.randn(10, 10)
		const t = Matrix.randn(10, 10)

		const y = net.calc(x, t)
		expect(y.sizes).toEqual([1, 1])
		expect(y.at(0, 0)).toBeCloseTo(Matrix.map(Matrix.sub(x, t), v => v ** 2).sum())
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'x' },
				{ type: 'full', out_size: 3, name: 'xo' },
				{ type: 'output' },
				{ type: 'supervisor', name: 't' },
				{ type: 'sub', input: ['xo', 't'] },
				{ type: 'square' },
				{ type: 'sum' },
			],
			null,
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.randn(1, 3)

		for (let i = 0; i < 100; i++) {
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
