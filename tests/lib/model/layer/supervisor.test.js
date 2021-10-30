import NeuralNetwork from '../../../../lib/model/neuralnetwork.js'
import { Matrix } from '../../../../lib/util/math.js'

describe('supervisor', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([
			{ type: 'input', name: 'x' },
			{ type: 'supervisor', name: 't' },
			{ type: 'sub', input: ['x', 't'] },
			{ type: 'square' },
			{ type: 'sum' },
		])
		const x = Matrix.randn(10, 10)
		const t = Matrix.randn(10, 10)

		const y = net.calc(x, t)
		expect(y.sizes).toEqual([1, 1])
		expect(y.at(0, 0)).toBeCloseTo(
			x
				.copySub(t)
				.copyMap(v => v ** 2)
				.sum()
		)
	})

	test.skip('grad', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'x' },
				{ type: 'full', out_size: 3, name: 'xo' },
				{ type: 'supervisor', name: 't' },
				{ type: 'sub', input: ['xo', 't'] },
				{ type: 'square' },
				{ type: 'sum' },
			],
			null,
			'adam'
		)
		const x = Matrix.random(1, 5, -0.1, 0.1)
		const t = Matrix.randn(1, 3)

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
