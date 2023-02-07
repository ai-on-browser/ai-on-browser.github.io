import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import PROCLUS from '../../../lib/model/proclus.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clarans', () => {
	test('default', () => {
		const model = new PROCLUS(3, 20, 2, 3)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 5, 0, 0.1), Matrix.randn(n, 5, 5, 0.1)),
			Matrix.randn(n, 5, [0, 5, -5, 5, 0], 0.1)
		).toArray()

		model.init(x)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict()
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.7)
	})

	test('high min deviation', () => {
		const model = new PROCLUS(3, 20, 10, 3, 0.9)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 5, 0, 0.1), Matrix.randn(n, 5, 5, 0.1)),
			Matrix.randn(n, 5, [0, 5, -5, 5, 0], 0.1)
		).toArray()

		model.init(x)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict()
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.7)
	})
})
