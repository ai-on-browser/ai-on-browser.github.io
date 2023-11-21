import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import FINDIT from '../../../lib/model/findit.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clustering', () => {
	const model = new FINDIT(20, 4)
	const n = 100
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 5, 0, 0.2), Matrix.randn(n, 5, 5, 0.2)),
		Matrix.randn(n, 5, [0, 5, -5, 5, 0], 0.2)
	).toArray()

	model.fit(x)
	expect(model.size).toBeGreaterThanOrEqual(2)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.7)
})
