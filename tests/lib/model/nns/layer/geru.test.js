import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

import Layer from '../../../../../lib/model/nns/layer/base.js'

const cdf = z => {
	const p = 0.3275911
	const a1 = 0.254829592
	const a2 = -0.284496736
	const a3 = 1.421413741
	const a4 = -1.453152027
	const a5 = 1.061405429

	const sign = z < 0 ? -1 : 1
	const x = Math.abs(z) / Math.sqrt(2)
	const t = 1 / (1 + p * x)
	const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
	return 0.5 * (1 + sign * erf)
}

describe('layer', () => {
	test('construct', () => {
		const layer = Layer.fromObject({ type: 'geru' })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'geru' })

			const x = Matrix.randn(100, 10)
			x.set(0, 0, 0)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBeCloseTo(x.at(i, j) * cdf(x.at(i, j)))
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'geru' })

			const x = Tensor.randn([15, 10, 7])
			x.set(0, 0, 0)
			const y = layer.calc(x)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(y.at(i, j, k)).toBeCloseTo(x.at(i, j, k) * cdf(x.at(i, j, k)))
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = Layer.fromObject({ type: 'geru' })

			const x = Matrix.randn(100, 10)
			x.set(0, 0, 0)
			layer.calc(x)

			const bo = Matrix.ones(100, 10)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBeCloseTo(
						cdf(x.at(i, j)) +
							(x.at(i, j) * Math.exp(-((x.at(i, j) / Math.sqrt(2)) ** 2))) / Math.sqrt(2 * Math.PI)
					)
				}
			}
		})

		test('tensor', () => {
			const layer = Layer.fromObject({ type: 'geru' })

			const x = Tensor.randn([15, 10, 7])
			x.set(0, 0, 0)
			layer.calc(x)

			const bo = Tensor.ones([15, 10, 7])
			const bi = layer.grad(bo)
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						expect(bi.at(i, j, k)).toBeCloseTo(
							cdf(x.at(i, j, k)) +
								(x.at(i, j, k) * Math.exp(-((x.at(i, j, k) / Math.sqrt(2)) ** 2))) /
									Math.sqrt(2 * Math.PI)
						)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = Layer.fromObject({ type: 'geru' })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'geru' })
	})

	test('fromObject', () => {
		const layer = Layer.fromObject({ type: 'geru' })
		expect(layer).toBeDefined()
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'geru' }])
		const x = Matrix.randn(10, 10)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) * cdf(x.at(i, j)))
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{ type: 'full', out_size: 3, w: Matrix.random(5, 3, 0, 0.1), b: Matrix.random(1, 3, 0, 0.1) },
				{ type: 'geru' },
			],
			'mse',
			'adam'
		)
		const x = Matrix.random(1, 5, 0, 0.1)
		const t = Matrix.random(1, 3, 0, 1)

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
