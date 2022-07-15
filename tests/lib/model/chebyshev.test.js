import { jest } from '@jest/globals'
jest.retryTimes(5)

import ChebyshevFilter from '../../../lib/model/chebyshev.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test.each([
	[1, 1],
	[1, 2],
	[1, 3],
	[1, 4],
	[2, 1],
	[2, 2],
	[2, 3],
	[2, 4],
])('smoothing %i %i', (type, n) => {
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 2
		t[i] = Math.sin(i / 20)
	}
	const model = new ChebyshevFilter(type, 0.2, n, 0.8)
	const y = model.predict(x)
	expect(y).toHaveLength(t.length)
	const err = rmse(y, t)
	expect(err).toBeLessThan(rmse(x, t))
})
