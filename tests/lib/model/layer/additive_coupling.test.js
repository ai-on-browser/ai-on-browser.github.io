import NeuralNetwork from '../../../../lib/model/neuralnetwork.js'
import { Matrix } from '../../../../lib/util/math.js'

describe('additive_coupling', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'additive_coupling' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual(x.sizes)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < Math.floor(x.cols / 2); j++) {
				expect(y.at(i, j)).toBe(x.at(i, j))
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
