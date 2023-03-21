import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import CLIQUE from '../../../lib/model/clique.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clustering', () => {
	test('scalar xi', () => {
		const model = new CLIQUE(0.3, 0.001)
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 4, 0, 0.1), Matrix.randn(n, 4, 5, 0.1)),
			Matrix.randn(n, 4, [0, 5, 0, 5], 0.1)
		).toArray()

		model.fit(x)
		expect(model.size).toBeGreaterThanOrEqual(3)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.8)
	})

	test('array xi', () => {
		const model = new CLIQUE([0.3, 0.2, 0.3, 0.2], 0.001)
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 4, 0, 0.1), Matrix.randn(n, 4, 5, 0.1)),
			Matrix.randn(n, 4, [0, 5, 0, 5], 0.1)
		).toArray()

		model.fit(x)
		expect(model.size).toBeGreaterThanOrEqual(3)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.7)
	})
})
