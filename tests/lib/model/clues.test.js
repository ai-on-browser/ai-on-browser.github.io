import { jest } from '@jest/globals'
jest.retryTimes(5)

import Matrix from '../../../lib/util/matrix.js'
import CLUES from '../../../lib/model/clues.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clustering', () => {
	test('default', () => {
		const model = new CLUES()
		const n = 100
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

		model.fit(x)
		const y = model.predict()
		expect(y).toHaveLength(x.length)
		expect(model.size).toBeGreaterThanOrEqual(2)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.5)
	})

	test('parameter', () => {
		const model = new CLUES(0.4)
		const n = 100
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

		model.fit(x)
		const y = model.predict()
		expect(y).toHaveLength(x.length)
		expect(model.size).toBeGreaterThanOrEqual(2)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test('small data', () => {
		const model = new CLUES(0.8)
		const x = Matrix.random(5, 2, -0.1, 0.1).toArray()

		model.fit(x)
		const y = model.predict()
		expect(y).toHaveLength(x.length)
		expect(model.size).toBe(1)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBe(0)
		}
	})
})
