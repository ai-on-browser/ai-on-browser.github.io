import { jest } from '@jest/globals'
jest.retryTimes(5)

import Matrix from '../../../lib/util/matrix.js'
import OPTICS from '../../../lib/model/optics.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clustering', () => {
	test.each([undefined, 'euclid', 'manhattan', 'chebyshev'])('%s', metric => {
		const model = new OPTICS(0.4, undefined, undefined, metric)
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [-1, 5], 0.1)
		).toArray()

		model.fit(x)
		const y = model.predict()
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test.each([(a, b) => a.reduce((s, v, i) => s + Math.exp((v - b[i]) ** 2) - 1, 0)])('%s', metric => {
		const model = new OPTICS(0.3, undefined, undefined, metric)
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [-1, 5], 0.1)
		).toArray()

		model.fit(x)
		const y = model.predict()
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})
})
