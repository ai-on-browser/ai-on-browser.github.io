import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import MLLE from '../../../lib/model/mlle.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

describe('dimensionality reduction', () => {
	test('default', () => {
		const x = Matrix.concat(Matrix.randn(30, 5, 0, 0.2), Matrix.randn(30, 5, 5, 0.2)).toArray()
		const y = new MLLE(8).predict(x)
		expect(y[0]).toHaveLength(5)
		const q = coRankingMatrix(x, y, 20, 30)
		expect(q).toBeGreaterThan(0.9)
	})

	test('k: 5', () => {
		const x = Matrix.concat(Matrix.randn(30, 5, 0, 0.2), Matrix.randn(30, 5, 5, 0.2)).toArray()
		const y = new MLLE(5, 2).predict(x)
		expect(y[0]).toHaveLength(2)
		const q = coRankingMatrix(x, y, 20, 30)
		expect(q).toBeGreaterThan(0.9)
	})
})
