import { Matrix } from '../../../lib/util/math.js'
import Sammon from '../../../lib/model/sammon.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('dimensionality reduction', () => {
	const x = Matrix.randn(50, 5, 0, 0.2).concat(Matrix.randn(50, 5, 5, 0.2)).toArray()
	const model = new Sammon(x, 2)

	for (let i = 0; i < 100; i++) {
		model.fit()
	}
	const y = model.fit()
	const q = coRankingMatrix(x, y, 30, 20)
	expect(q).toBeGreaterThan(0.9)
})
