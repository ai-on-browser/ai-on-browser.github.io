import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import SST from '../../../lib/model/sst.js'

test('anomaly detection', () => {
	const w = 20
	const model = new SST(w)
	const n = 100
	const x = Matrix.random(n, 1, 0, 1).concat(Matrix.random(n, 1, 10, 11)).value
	const p = model.predict(x)

	const threshold = 0.1
	const range = w * 2
	let c = 0
	for (let i = 0; i < p.length; i++) {
		if (i < n - range || n < i) {
			expect(p[i]).toBeLessThan(threshold)
		} else {
			if (p[i] >= threshold) {
				c++
			}
		}
	}
	expect(c).toBeGreaterThan(0)
})
