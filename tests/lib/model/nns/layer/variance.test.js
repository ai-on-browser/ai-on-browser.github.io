import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import VarianceLayer from '../../../../../lib/model/nns/layer/variance.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new VarianceLayer({})
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new VarianceLayer({})

		const x = Matrix.randn(100, 10)
		const y = layer.calc(x)

		const v = x.variance()
		expect(y.sizes).toEqual([1, 1])
		expect(y.at(0, 0)).toBeCloseTo(v)
	})

	test('grad', () => {
		const layer = new VarianceLayer({})

		const x = Matrix.randn(100, 10)
		layer.calc(x)
		const m = x.mean()

		const bo = Matrix.ones(1, 1)
		const bi = layer.grad(bo)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(bi.at(i, j)).toBeCloseTo(((x.at(i, j) - m) * 2) / 1000)
			}
		}
	})

	test('toObject', () => {
		const layer = new VarianceLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'variance', axis: -1 })
	})

	test('fromObject', () => {
		const layer = VarianceLayer.fromObject({ type: 'variance', axis: -1 })
		expect(layer).toBeInstanceOf(VarianceLayer)
	})
})

describe('nn', () => {
	describe('axis -1', () => {
		test('calc', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'variance' }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.variance()
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(s)
		})

		test('grad', () => {
			const net = NeuralNetwork.fromObject(
				[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'variance' }],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -0.1, 0.1)
			const t = Matrix.random(1, 1, 0.1, 1)

			for (let i = 0; i < 100; i++) {
				const loss = net.fit(x, t, 1000, 0.01)
				if (loss[0] < 1.0e-8) {
					break
				}
			}

			const y = net.calc(x)
			expect(y.at(0, 0)).toBeCloseTo(t.at(0, 0))
		})
	})

	describe.each([0, 1])('axis %i', axis => {
		test('calc', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'variance', axis }])
			const x = Matrix.randn(10, 10)

			const y = net.calc(x)
			const s = x.variance(axis)
			expect(y.sizes).toEqual(s.sizes)
			for (let i = 0; i < s.rows; i++) {
				for (let j = 0; j < s.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(s.at(i, j))
				}
			}
		})

		test('grad', () => {
			const net = NeuralNetwork.fromObject(
				[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'variance', axis }],
				'mse',
				'adam'
			)
			const x = Matrix.random(4, 5, -0.1, 0.1)
			const size = axis === 0 ? [1, 3] : [4, 1]
			const t = Matrix.random(...size, 0.1, 1)

			for (let i = 0; i < 100; i++) {
				const loss = net.fit(x, t, 1000, 0.01)
				if (loss[0] < 1.0e-8) {
					break
				}
			}

			const y = net.calc(x)
			for (let i = 0; i < t.rows; i++) {
				for (let j = 0; j < t.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(t.at(i, j))
				}
			}
		})
	})
})
