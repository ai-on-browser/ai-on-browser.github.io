import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

describe('matmul', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'input', name: 'c' },
			{ type: 'matmul', input: ['a', 'b', 'c'] },
		])
		const a = Matrix.randn(10, 7)
		const b = Matrix.randn(7, 5)
		const c = Matrix.randn(5, 3)

		const y = net.calc({ a, b, c })
		const d = a.dot(b).dot(c)
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < c.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(d.at(i, j))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 4, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 3, name: 'bo' },
				{ type: 'input', name: 'c' },
				{ type: 'full', out_size: 2, name: 'co' },
				{ type: 'matmul', input: ['ao', 'bo', 'co'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(4, 5, -0.1, 0.1)
		const c = Matrix.random(3, 5, -0.1, 0.1)
		const t = Matrix.random(1, 2, -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ a, b, c }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b, c })
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})
