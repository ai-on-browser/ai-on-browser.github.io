import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import PolynomialHistogram from '../../../lib/model/polynomial_histogram.js'

import { correlation } from '../../../lib/evaluate/regression.js'

test('density estimation', () => {
	const model = new PolynomialHistogram(2, 2)
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
	expect(corr).toBeGreaterThan(0.5)
})
