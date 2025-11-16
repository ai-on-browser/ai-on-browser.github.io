import Matrix from '../../../lib/util/matrix.js'
import Isomap from '../../../lib/model/isomap.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

describe('dimensionality reduction', () => {
	test('default', () => {
		const x = Matrix.randn(50, 5, 0, 0.2).toArray()

		const y = new Isomap().predict(x)
		expect(y[0]).toHaveLength(5)
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})

	test.each([undefined, 10])('n: %j', n => {
		const x = Matrix.randn(50, 5, 0, 0.2).toArray()

		const y = new Isomap(n, 2).predict(x)
		expect(y[0]).toHaveLength(2)
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})
})
