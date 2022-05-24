import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import SplitLayer from '../../../../../lib/model/nns/layer/split.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new SplitLayer({ size: 2 })
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new SplitLayer({ size: [3, 7] })

		const x = Matrix.randn(100, 10)
		const y = layer.calc(x)
		expect(y).toHaveLength(2)
		expect(y[0].sizes).toEqual([100, 3])
		expect(y[1].sizes).toEqual([100, 7])
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < y[0].cols; j++) {
				expect(y[0].at(i, j)).toBeCloseTo(x.at(i, j))
			}
			for (let j = 0; j < y[1].cols; j++) {
				expect(y[1].at(i, j)).toBeCloseTo(x.at(i, j + y[0].cols))
			}
		}
	})

	test('grad', () => {
		const layer = new SplitLayer({ size: [3, 7] })

		const x = Matrix.randn(100, 10)
		layer.calc(x)

		const bo = [Matrix.ones(100, 3), Matrix.ones(100, 7)]
		const bi = layer.grad(...bo)
		expect(bi.sizes).toEqual([100, 10])
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(bi.at(i, j)).toBe(1)
			}
		}
	})

	test('toObject', () => {
		const layer = new SplitLayer({ size: [3, 7] })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'split', axis: 1, size: [3, 7] })
	})

	test('fromObject', () => {
		const layer = SplitLayer.fromObject({ type: 'split', axis: 1, size: [3, 7] })
		expect(layer).toBeInstanceOf(SplitLayer)
	})
})

describe('nn', () => {
	test('calc axis 1', () => {
		const spls = [1, 2, 3, 4]
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'split', size: spls }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		expect(y).toHaveLength(4)
		let c = 0
		for (let k = 0; k < 4; k++) {
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < spls[k]; j++) {
					expect(y[k].at(i, j)).toBeCloseTo(x.at(i, j + c))
				}
			}
			c += spls[k]
		}
	})

	test('calc axis 0', () => {
		const spls = [1, 2, 3, 4]
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'split', axis: 0, size: spls }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		expect(y).toHaveLength(4)
		let r = 0
		for (let k = 0; k < 4; k++) {
			for (let i = 0; i < spls[k]; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y[k].at(i, j)).toBeCloseTo(x.at(i + r, j))
				}
			}
			r += spls[k]
		}
	})

	test('grad axis 1', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 10 },
				{ type: 'split', size: [1, 2, 3, 4], name: 's' },
				{ type: 'output', input: 's[3]' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 4, -0.1, 0.1)

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

	test('grad axis 0', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3 },
				{ type: 'split', axis: 0, size: [2, 1, 2], name: 's' },
				{ type: 'output', input: 's[1]' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(5, 4, -0.1, 0.1)
		const t = Matrix.random(1, 3, -0.1, 0.1)

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
