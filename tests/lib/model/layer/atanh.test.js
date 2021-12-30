import NeuralNetwork from '../../../../lib/model/neuralnetwork.js'
import { Matrix } from '../../../../lib/util/math.js'

describe('atanh', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'atanh' }])
		const x = Matrix.random(10, 10, -0.9, 0.9)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.atanh(x.at(i, j)))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3 },
				{ type: 'clip', min: -0.9999, max: 0.9999 },
				{ type: 'atanh' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 3, -2, 2)

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
