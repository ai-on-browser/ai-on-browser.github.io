import Matrix from '../../../lib/util/matrix.js'
import FastMap from '../../../lib/model/fastmap.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('dimensionality reduction', () => {
	const x = Matrix.concat(Matrix.randn(50, 5, 0, 0.2), Matrix.randn(50, 5, 5, 0.2)).toArray()
	const y = new FastMap(2).predict(x)
	expect(y[0]).toHaveLength(2)
	const q = coRankingMatrix(x, y, 30, 20)
	expect(q).toBeGreaterThan(0.9)
})
