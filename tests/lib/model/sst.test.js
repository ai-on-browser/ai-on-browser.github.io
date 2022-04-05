import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import SST from '../../../lib/model/sst.js'

test('anomaly detection', () => {
	const w = 20
	const model = new SST(w)
	const n = 100
	const x = Matrix.concat(Matrix.random(n, 1, 0, 1), Matrix.random(n, 1, 10, 11)).value
	const p = model.predict(x)

	const threshold = 0.1
	const range = w * 2
	let c = 0
	for (let i = 0; i < p.length; i++) {
		if (i <= n && n - range <= i) {
			if (p[i] >= threshold) {
				c++
			}
			continue
		}
		expect(p[i]).toBeLessThan(threshold)
	}
	expect(c).toBeGreaterThan(0)
})
