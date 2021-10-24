import NeuralNetwork from '../../../../lib/model/neuralnetwork.js'
import { Matrix } from '../../../../lib/util/math.js'

describe('detach', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'detach' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'detach' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.randn(1, 3)
		const orgy = net.calc(x)

		for (let i = 0; i < 10; i++) {
			net.fit(x, t, 1000, 0.01)
		}

		const y = net.calc(x)
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(orgy.at(0, i))
		}
	})
})
