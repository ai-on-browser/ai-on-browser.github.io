import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import AdditiveCoupling from '../../../../../lib/model/nns/layer/additive_coupling.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new AdditiveCoupling({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new AdditiveCoupling({})

			const x = Matrix.randn(100, 10)
			const y = layer.calc(x)
			expect(y.sizes).toEqual(x.sizes)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < Math.floor(x.cols / 2); j++) {
					expect(y.at(i, j)).toBe(x.at(i, j))
				}
				for (let j = Math.floor(x.cols / 2); j < x.cols; j++) {
					expect(y.at(i, j)).not.toBe(x.at(i, j))
				}
			}
		})

		test('tensor', () => {
			const layer = new AdditiveCoupling({})

			const x = Tensor.randn([2, 3, 4])
			expect(() => layer.calc(x)).toThrow()
		})
	})

	test('inverse', () => {
		const layer = new AdditiveCoupling({})

		const x = Matrix.randn(100, 10)
		const y = layer.calc(x)
		const x0 = layer.inverse(y)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(x0.at(i, j)).toBeCloseTo(x.at(i, j))
			}
		}
	})

	test('grad', () => {
		const layer = new AdditiveCoupling({})

		const x = Matrix.randn(100, 10)
		layer.calc(x)

		const bo = Matrix.ones(100, 10)
		const bi = layer.grad(bo)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < Math.floor(x.cols / 2); j++) {
				expect(bi.at(i, j)).not.toBe(1)
			}
			for (let j = Math.floor(x.cols / 2); j < x.cols; j++) {
				expect(bi.at(i, j)).toBe(1)
			}
		}
	})

	test('toObject', () => {
		const layer = new AdditiveCoupling({})

		const obj = layer.toObject()
		expect(obj.type).toBe('additive_coupling')
	})

	test('fromObject', () => {
		const orglayer = new AdditiveCoupling({})
		orglayer.calc(Matrix.randn(100, 10))
		const layer = AdditiveCoupling.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(AdditiveCoupling)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'additive_coupling' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual(x.sizes)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < Math.floor(x.cols / 2); j++) {
				expect(y.at(i, j)).toBe(x.at(i, j))
			}
			for (let j = Math.floor(x.cols / 2); j < x.cols; j++) {
				expect(y.at(i, j)).not.toBe(x.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'additive_coupling' }, { type: 'reverse' }, { type: 'additive_coupling' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 5, -0.5, 1)

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
