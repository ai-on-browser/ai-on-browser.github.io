import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import LTSA from '../../../lib/model/ltsa.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('dimensionality reduction', () => {
	const x = Matrix.concat(Matrix.randn(30, 5, 0, 0.5), Matrix.randn(30, 5, 5, 0.5)).toArray()
	const y = new LTSA(6).predict(x, 2)
	const q = coRankingMatrix(x, y, 20, 20)
	expect(q).toBeGreaterThan(0.8)
})
