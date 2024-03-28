import { jest } from '@jest/globals'
jest.retryTimes(5)

import Matrix from '../../../lib/util/matrix.js'
import LTSA from '../../../lib/model/ltsa.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

describe('dimensionality reduction', () => {
	test('default', () => {
		const x = Matrix.concat(Matrix.randn(30, 5, 0, 0.5), Matrix.randn(30, 5, 5, 0.5)).toArray()
		const y = new LTSA(4).predict(x)
		expect(y[0]).toHaveLength(5)
		const q = coRankingMatrix(x, y, 20, 20)
		expect(q).toBeGreaterThan(0.75)
	})

	test('k: 6', () => {
		const x = Matrix.concat(Matrix.randn(30, 5, 0, 0.5), Matrix.randn(30, 5, 5, 0.5)).toArray()
		const y = new LTSA(6, 2).predict(x)
		expect(y[0]).toHaveLength(2)
		const q = coRankingMatrix(x, y, 20, 20)
		expect(q).toBeGreaterThan(0.8)
	})
})
