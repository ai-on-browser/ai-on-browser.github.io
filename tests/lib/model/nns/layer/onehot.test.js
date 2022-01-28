import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

describe('onehot', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'onehot' }])
		const x = Matrix.random(10, 1, 0, 5)
		x.map(v => Math.floor(v))

		const y = net.calc(x)
		const idx = []
		for (let i = 0; i < x.rows; i++) {
			if (idx[x.at(i, 0)] === undefined) {
				idx[x.at(i, 0)] = y.row(i).argmax(1).toScaler()
			}
			for (let j = 0; j < y.cols; j++) {
				expect(y.at(i, j)).toBe(idx[x.at(i, 0)] === j ? 1 : 0)
			}
		}
	})
})
