import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import GMeans from '../../../lib/model/gmeans.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('predict', () => {
	const model = new GMeans()
	const n = 50
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, [2, 5], 0.1)),
		Matrix.randn(n, 2, [-2, 5], 0.1)
	).toArray()

	for (let i = 0; i < 20; i++) {
		model.fit(x)
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
