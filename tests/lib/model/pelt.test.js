import { jest, test } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import PELT from '../../../lib/model/pelt.js'

describe('change point detection', () => {
	test.each([undefined, 'rbf'])('cost %p', cost => {
		const model = new PELT(0, cost)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.random(n, 1, 0, 1), Matrix.random(n, 1, 3, 4)),
			Matrix.random(n, 1, 6, 7)
		).toArray()
		const p = model.predict(x)

		for (let i = 0; i < p.length; i++) {
			expect(p[i]).toBe(i === 50 || i === 100)
		}
	})

	test.each(['l1', 'l2'])('cost %p', cost => {
		const model = new PELT(1.0, cost)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.random(n, 1, 0, 1), Matrix.random(n, 1, 5, 6)),
			Matrix.random(n, 1, 10, 11)
		).toArray()
		const p = model.predict(x)

		const range = 5
		let c = 0
		let o = 0
		for (let i = 0; i < p.length; i++) {
			if (i > n - range && (i % n < range || i % n >= n - range)) {
				if (p[i]) {
					c++
				}
			}
			if (p[i]) {
				o++
			}
		}
		expect(c).toBeGreaterThanOrEqual(2)
		expect(o / x.length).toBeLessThan(0.05)
	})
})
