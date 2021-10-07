import NeuralNetwork from '../../../../lib/model/neuralnetwork.js'
import { Matrix } from '../../../../lib/util/math.js'

describe('onehot', () => {
	test('calc', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'onehot' }])
		const x = Matrix.random(10, 1, 0, 5)
		x.map(v => Math.floor(v))

		const y = net.calc(x)
		const idx = []
		for (let i = 0; i < x.rows; i++) {
			if (idx[x.at(i, 0)] === undefined) {
				idx[x.at(i, 0)] = y.row(i).argmax(1).value[0]
			}
			for (let j = 0; j < y.cols; j++) {
				if (idx[x.at(i, 0)] === j) {
					expect(y.at(i, j)).toBe(1)
				} else {
					expect(y.at(i, j)).toBe(0)
				}
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 1 }, { type: 'onehot' }],
			'mse',
			'adam'
		)
		const x = Matrix.random(5, 3, -0.1, 0.1)
		const t = Matrix.zeros(5, 5)
		for (let i = 0; i < 5; i++) {
			t.set(i, i, 1)
		}

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
