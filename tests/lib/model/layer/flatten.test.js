import NeuralNetwork from '../../../../lib/model/neuralnetwork.js'
import { Matrix, Tensor } from '../../../../lib/util/math.js'

describe('flatten', () => {
	test('calc mat', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'flatten' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([10, 10])
		for (let i = 0; i < x.length; i++) {
			expect(y.value[i]).toBeCloseTo(x.value[i])
		}
	})

	test('calc ten', () => {
		const net = new NeuralNetwork([{ type: 'input' }, { type: 'flatten' }])
		const x = Tensor.randn([10, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([10, 100])
		for (let i = 0; i < x.length; i++) {
			expect(y.value[i]).toBeCloseTo(x.value[i])
		}
	})

	test('grad mat', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'flatten' }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
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

	test('grad ten', () => {
		const net = new NeuralNetwork(
			[{ type: 'input' }, { type: 'conv', kernel: 3 }, { type: 'flatten' }],
			'mse',
			'adam'
		)
		const x = Tensor.randn([1, 4, 4, 3])
		const t = Matrix.randn(1, 24)

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
