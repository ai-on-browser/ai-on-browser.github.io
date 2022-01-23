import Matrix from '../../../lib/util/matrix.js'
import SlicedInverseRegression from '../../../lib/model/sir.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('dimensionality reduction', () => {
	const n = 50
	const x = Matrix.randn(n, 5, 0, 0.2).concat(Matrix.randn(n, 5, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const y = new SlicedInverseRegression(2).predict(x, t, 2)
	const q = coRankingMatrix(x, y, 10, 30)
	expect(q).toBeGreaterThan(0.9)
})
