import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import GTM from '../../../lib/model/gtm.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'
import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('clustering', () => {
	const model = new GTM(2, 1, 3)
	const n = 50
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
		Matrix.randn(n, 2, [0, 5], 0.1)
	).toArray()

	for (let i = 0; i < 100; i++) {
		model.fit(x)
	}
	const y = model.predictIndex(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})

test('dimensionality reduction', () => {
	const x = Matrix.concat(Matrix.randn(50, 5, 0, 0.2), Matrix.randn(50, 5, 5, 0.2)).toArray()

	const model = new GTM(5, 2, 3)
	for (let i = 0; i < 100; i++) {
		model.fit(x)
	}
	const y = model.predict(x)
	const q = coRankingMatrix(x, y, 20, 20)
	expect(q).toBeGreaterThan(0.8)
})
