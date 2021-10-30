import NeuralNetwork from '../../../../lib/model/neuralnetwork.js'
import { Matrix } from '../../../../lib/util/math.js'

describe('full', () => {
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
