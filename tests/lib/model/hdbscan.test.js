import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import HDBSCAN from '../../../lib/model/hdbscan.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test.each(['euclid', 'manhattan', 'chebyshev'])('clustering %s', metric => {
	const model = new HDBSCAN(undefined, 2, metric)
	const n = 50
	const x = Matrix.randn(n, 2, 0, 0.2)
		.concat(Matrix.randn(n, 2, 5, 0.2))
		.concat(Matrix.randn(n, 2, [0, 5], 0.2))
		.toArray()

	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
