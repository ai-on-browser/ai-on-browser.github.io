import Matrix from '../../../lib/util/matrix.js'
import AverageShiftedHistogram from '../../../lib/model/average_shifted_histogram.js'

import { correlation } from '../../../lib/evaluate/regression.js'

describe('density estimation', () => {
	test('size', () => {
		const model = new AverageShiftedHistogram({ size: 0.1 }, 10)
		const n = 500
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()
		model.fit(x)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const p = []
		for (let i = 0; i < x.length; i++) {
			const p1 = Math.exp(-x[i].reduce((s, v) => s + v ** 2, 0) / (2 * 0.1)) / (2 * Math.PI * 0.1)
			const p2 = Math.exp(-x[i].reduce((s, v) => s + (v - 5) ** 2, 0) / (2 * 0.1)) / (2 * Math.PI * 0.1)
			p[i] = (p1 + p2) / 2
		}
		const corr = correlation(y, p)
		expect(corr).toBeGreaterThan(0.9)
	})

	test('domain', () => {
		const model = new AverageShiftedHistogram(
			{
				domain: [
					[-1, 1],
					[-1, 1],
				],
				size: 0.1,
			},
			10
		)
		const n = 5000
		const x = Matrix.random(n, 2, -1, 1).toArray()
		model.fit(x)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
	})

	test('outsize', () => {
		const model = new AverageShiftedHistogram({ size: 0.1 }, 10)
		const n = 500
		const x = Matrix.randn(n, 2, 0, 0.1).toArray()
		model.fit(x)
		const y = model.predict([[-10, -10]])
		expect(y[0]).toBe(0)
	})
})
