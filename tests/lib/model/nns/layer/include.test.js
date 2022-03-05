import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import IncludeLayer from '../../../../../lib/model/nns/layer/include.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new IncludeLayer({ net: [{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'output' }] })
		expect(layer).toBeDefined()
	})

	test('calc', () => {
		const layer = new IncludeLayer({ net: [{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'output' }] })

		const x = Matrix.randn(100, 10)
		const y = layer.calc(x)
		expect(y.sizes).toEqual([100, 3])
	})

	test('grad', () => {
		const layer = new IncludeLayer({ net: [{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'output' }] })

		const x = Matrix.randn(100, 10)
		layer.calc(x)

		const bo = Matrix.ones(100, 3)
		const bi = layer.grad(bo)
		expect(bi.sizes).toEqual([100, 10])
	})

	test('toObject', () => {
		const layer = new IncludeLayer({ net: [{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'output' }] })

		const obj = layer.toObject()
		expect(obj.type).toBe('include')
		expect(obj.net).toHaveLength(4)
		expect(obj.input_to).toBeNull()
		expect(obj.train).toBeTruthy()
	})
})

describe('nn', () => {
	test('calc', () => {
		const inc = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'tanh' }])
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'include', net: inc }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(Math.tanh(x.at(i, j)))
			}
		}
	})

	test('grad', () => {
		const inc = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'tanh' }])
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'full', out_size: 3 }, { type: 'include', net: inc }],
			'mse',
			'adam'
		)
		const x = Matrix.randn(1, 5)
		const t = Matrix.random(1, 3, -0.9, 0.9)

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