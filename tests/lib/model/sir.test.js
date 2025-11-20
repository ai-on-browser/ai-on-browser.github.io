import Matrix from '../../../lib/util/matrix.js'
import SlicedInverseRegression from '../../../lib/model/sir.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

describe('dimensionality reduction', () => {
	test('default', { retry: 3 }, () => {
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 5, 0, 0.2), Matrix.randn(n, 5, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const y = new SlicedInverseRegression(2).predict(x, t)
		expect(y[0]).toHaveLength(5)
		const q = coRankingMatrix(x, y, 10, 30)
		expect(q).toBeGreaterThan(0.85)
	})

	test('2', () => {
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 5, 0, 0.2), Matrix.randn(n, 5, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const y = new SlicedInverseRegression(2, 2).predict(x, t)
		expect(y[0]).toHaveLength(2)
		const q = coRankingMatrix(x, y, 10, 30)
		expect(q).toBeGreaterThan(0.9)
	})
})
