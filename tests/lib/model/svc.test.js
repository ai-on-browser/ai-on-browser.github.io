import { jest } from '@jest/globals'
jest.retryTimes(5)

import Matrix from '../../../lib/util/matrix.js'
import SVC from '../../../lib/model/svc.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clustering', () => {
	test('gaussian', () => {
		const model = new SVC('gaussian')
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		model.init(x)
		for (let i = 0; i < 20; i++) {
			model.fit()
		}
		expect(model.size).toBeGreaterThanOrEqual(3)
		const y = model.predict()
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.8)
	})

	test('linear', () => {
		const model = new SVC('linear')
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		model.init(x)
		for (let i = 0; i < 20; i++) {
			model.fit()
		}
		expect(model.size).toBeGreaterThanOrEqual(3)
		const y = model.predict()
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.6)
	})

	test('custom kernel', () => {
		const model = new SVC((a, b) => Math.exp(-0.5 * a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2))
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

		model.init(x)
		for (let i = 0; i < 20; i++) {
			model.fit()
		}
		const y = model.predict()
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.6)
	})
})
