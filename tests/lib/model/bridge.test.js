import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import BRIDGE from '../../../lib/model/bridge.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clustering', () => {
	test('1', () => {
		const model = new BRIDGE(2, 0.2, 1)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 1, 0, 0.2), Matrix.randn(n, 1, 5, 0.2)),
			Matrix.randn(n, 1, 10, 0.2)
		).toArray()

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test.each([2, 3, 4])('%d', dim => {
		const model = new BRIDGE(2, 0.2, 1)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, dim, 0, 0.2), Matrix.randn(n, dim, 5, 0.2)),
			Matrix.randn(n, dim, [0, ...Array(dim - 1).fill(5)], 0.2)
		).toArray()

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})
})
