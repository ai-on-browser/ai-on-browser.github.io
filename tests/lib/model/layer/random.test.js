import NeuralNetwork from '../../../../lib/model/neuralnetwork.js'

describe('random', () => {
	test('scalar', () => {
		const net = NeuralNetwork.fromObject([{ type: 'random', size: 5 }])
		const y1 = net.calc([[]])
		expect(y1.sizes).toEqual([1, 5])
		const y2 = net.calc([[]])
		expect(y2.sizes).toEqual([1, 5])
		for (let i = 0; i < y1.cols; i++) {
			expect(y1.at(0, i)).not.toBe(y2.at(0, i))
		}
	})
})
