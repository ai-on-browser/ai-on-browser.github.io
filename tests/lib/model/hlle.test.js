import { jest } from '@jest/globals'
jest.retryTimes(5)

import Matrix from '../../../lib/util/matrix.js'
import HLLE from '../../../lib/model/hlle.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

describe('dimensionality reduction', () => {
	test('default', () => {
		const x = Matrix.concat(Matrix.randn(30, 5, 0, 0.2), Matrix.randn(30, 5, 5, 0.2)).toArray()
		const y = new HLLE(9).predict(x)
		expect(y[0]).toHaveLength(5)
		const q = coRankingMatrix(x, y, 20, 20)
		expect(q).toBeGreaterThan(0.85)
	})

	test('10', () => {
		const x = Matrix.concat(Matrix.randn(30, 5, 0, 0.2), Matrix.randn(30, 5, 5, 0.2)).toArray()
		const y = new HLLE(10, 2).predict(x)
		expect(y[0]).toHaveLength(2)
		const q = coRankingMatrix(x, y, 20, 20)
		expect(q).toBeGreaterThan(0.9)
	})
})
