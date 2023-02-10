import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import ORCLUS from '../../../lib/model/orclus.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clustering', () => {
	const model = new ORCLUS(3, 20, 4)
	const n = 100
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 5, 0, 0.1), Matrix.randn(n, 5, 5, 0.1)),
		Matrix.randn(n, 5, [0, 5, -5, 5, 0], 0.1)
	).toArray()

	model.fit(x)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.8)
})
