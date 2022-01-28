import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

describe('input', () => {
	test('one input', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j))
			}
		}
	})

	test('named input', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'a' },
			{ type: 'input', name: 'b' },
			{ type: 'concat', input: ['a', 'b'] },
		])
		const a = Matrix.randn(10, 10)
		const b = Matrix.randn(10, 10)

		const y = net.calc({ a, b })
		for (let i = 0; i < a.rows; i++) {
			for (let j = 0; j < a.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(a.at(i, j))
			}
			for (let j = 0; j < b.cols; j++) {
				expect(y.at(i, j + a.cols)).toBeCloseTo(b.at(i, j))
			}
		}
	})
})
