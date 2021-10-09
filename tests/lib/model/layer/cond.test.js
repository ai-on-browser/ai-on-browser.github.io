import NeuralNetwork from '../../../../lib/model/neuralnetwork.js'
import { Matrix } from '../../../../lib/util/math.js'

describe('cond', () => {
	test('calc', () => {
		const net = new NeuralNetwork([
			{ type: 'input', name: 'c' },
			{ type: 'input', name: 't' },
			{ type: 'input', name: 'f' },
			{ type: 'cond', input: ['c', 't', 'f'] },
		])
		const t = Matrix.randn(10, 10)
		const f = Matrix.randn(10, 10)
		const c = Matrix.randn(10, 10)
		c.map(v => v < 0)

		const y = net.calc({ c, t, f })
		for (let i = 0; i < c.rows; i++) {
			for (let j = 0; j < c.cols; j++) {
				expect(y.at(i, j)).toBe(c.at(i, j) ? t.at(i, j) : f.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = new NeuralNetwork(
			[
				{ type: 'input', name: 't' },
				{ type: 'full', out_size: 3, name: 'to' },
				{ type: 'input', name: 'f' },
				{ type: 'full', out_size: 3, name: 'fo' },
				{ type: 'input', name: 'c' },
				{ type: 'cond', input: ['c', 'to', 'fo'] },
			],
			'mse',
			'adam'
		)
		const x1 = Matrix.randn(1, 5)
		const x2 = Matrix.randn(1, 5)
		const c = Matrix.randn(1, 3)
		c.map(v => v < 0)
		const t = Matrix.randn(1, 3)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ t: x1, f: x2, c }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ t: x1, f: x2, c })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})
