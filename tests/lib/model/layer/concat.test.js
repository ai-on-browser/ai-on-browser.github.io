import NeuralNetwork from '../../../../lib/model/neuralnetwork.js'
import { Matrix } from '../../../../lib/util/math.js'

describe('concat', () => {
	test('calc axis 1', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'input', name: 'c' },
			{ type: 'concat', axis: 1, input: ['a', 'b', 'c'] },
		])
		const a = Matrix.randn(10, 2)
		const b = Matrix.randn(10, 3)
		const c = Matrix.randn(10, 4)

		const y = net.calc({ a, b, c })
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(a.at(i, j))
			}
			for (let j = 0; j < b.cols; j++) {
				expect(y.at(i, j + a.cols)).toBeCloseTo(b.at(i, j))
			}
			for (let j = 0; j < c.cols; j++) {
				expect(y.at(i, j + a.cols + b.cols)).toBeCloseTo(c.at(i, j))
			}
		}
	})

	test('calc axis 0', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'input', name: 'c' },
			{ type: 'concat', axis: 0, input: ['a', 'b', 'c'] },
		])
		const a = Matrix.randn(2, 10)
		const b = Matrix.randn(3, 10)
		const c = Matrix.randn(4, 10)

		const y = net.calc({ a, b, c })
		for (let j = 0; j < a.cols; j++) {
			for (let i = 0; i < a.rows; i++) {
				expect(y.at(i, j)).toBeCloseTo(a.at(i, j))
			}
			for (let i = 0; i < b.rows; i++) {
				expect(y.at(i + a.rows, j)).toBeCloseTo(b.at(i, j))
			}
			for (let i = 0; i < c.rows; i++) {
				expect(y.at(i + a.rows + b.rows, j)).toBeCloseTo(c.at(i, j))
			}
		}
	})

	test('grad axis 1', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 3, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 2, name: 'bo' },
				{ type: 'input', name: 'c' },
				{ type: 'full', out_size: 1, name: 'co' },
				{ type: 'concat', input: ['ao', 'bo', 'co'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(1, 5, -0.1, 0.1)
		const c = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.random(1, 6, -0.1, 0.1)

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

	test('grad axis 0', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'a' },
				{ type: 'full', out_size: 3, name: 'ao' },
				{ type: 'input', name: 'b' },
				{ type: 'full', out_size: 3, name: 'bo' },
				{ type: 'input', name: 'c' },
				{ type: 'full', out_size: 3, name: 'co' },
				{ type: 'concat', axis: 0, input: ['ao', 'bo', 'co'] },
			],
			'mse',
			'adam'
		)
		const a = Matrix.random(1, 5, -0.1, 0.1)
		const b = Matrix.random(1, 4, -0.1, 0.1)
		const c = Matrix.random(1, 3, -0.1, 0.1)
		const t = Matrix.random(3, 3, -0.1, 0.1)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit({ a, b, c }, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc({ a, b, c })
		for (let i = 0; i < t.rows; i++) {
			for (let j = 0; j < t.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(t.at(i, j))
			}
		}
	})
})