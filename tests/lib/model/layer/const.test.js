import NeuralNetwork from '../../../../lib/model/neuralnetwork.js'

describe('const', () => {
	test('scalar', () => {
		const net = new NeuralNetwork([{ type: 'const', value: 1 }])
		const y = net.calc([])
		expect(y.sizes).toEqual([1, 1])
		expect(y.at(0, 0)).toBeCloseTo(1)
	})
})
