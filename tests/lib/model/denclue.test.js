import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import DENCLUE from '../../../lib/model/denclue.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clustering', () => {
	test.each([undefined, 1, 2])('version %p', version => {
		const model = new DENCLUE(0.2, version)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		model.init(x)
		for (let i = 0; i < 100; i++) {
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
		expect(ri).toBeGreaterThan(0.9)
	})

	test.each(['gaussian', { name: 'gaussian' }])('kernel %p', kernel => {
		const model = new DENCLUE(0.2, undefined, kernel)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		model.init(x)
		for (let i = 0; i < 100; i++) {
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
		expect(ri).toBeGreaterThan(0.9)
	})

	test('custom kernel', () => {
		const model = new DENCLUE(2, 1, a => (Math.sqrt(a.reduce((s, v) => s + v ** 2, 0)) < 1 ? 1 : 0))
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		model.init(x)
		for (let i = 0; i < 100; i++) {
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
		expect(ri).toBeGreaterThan(0.9)
	})
})
