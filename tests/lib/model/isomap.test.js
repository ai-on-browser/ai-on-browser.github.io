import { Matrix } from '../../../lib/util/math.js'
import Isomap from '../../../lib/model/isomap.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('dimensionality reduction', () => {
	const x = Matrix.randn(50, 5, 0, 0.2).toArray()

	const y = new Isomap().predict(x, 2)
	const q = coRankingMatrix(x, y, 30, 20)
	expect(q).toBeGreaterThan(0.9)
})
