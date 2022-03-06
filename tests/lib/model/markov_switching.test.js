import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import MarkovSwitching from '../../../lib/model/markov_switching.js'

test('anomaly detection', () => {
	const model = new MarkovSwitching(2)
	const n = 50
	const x = Matrix.concat(Matrix.random(n, 2, 0, 1), Matrix.random(n, 2, 2, 3)).toArray()

	model.fit(x, 1, 2000)
	const p = model.predict(x)

	const threshold = 0.1
	const range = 5
	let c = 0
	for (let i = 0; i < p.length; i++) {
		if (i < n - range || n + range < i) {
			expect(p[i]).toBeLessThan(threshold)
		} else {
			if (p[i] >= threshold) {
				c++
			}
		}
	}
	expect(c).toBeGreaterThan(0)
})
