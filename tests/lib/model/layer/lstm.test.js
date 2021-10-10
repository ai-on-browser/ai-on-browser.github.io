import NeuralNetwork from '../../../../lib/model/neuralnetwork.js'
import { Matrix, Tensor } from '../../../../lib/util/math.js'

describe('lstm', () => {
	test('update', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'lstm', size: 4 }], 'mse', 'adam')
		const x = Tensor.randn([1, 10, 6])
		const t = Matrix.random(1, 4, -0.9, 0.9)

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
