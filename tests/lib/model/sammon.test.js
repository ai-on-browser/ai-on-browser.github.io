import Matrix from '../../../lib/util/matrix.js'
import Sammon from '../../../lib/model/sammon.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('dimensionality reduction', () => {
	const x = Matrix.concat(Matrix.randn(30, 5, 0, 0.2), Matrix.randn(30, 5, 5, 0.2)).toArray()
	const model = new Sammon(x, 2)

	for (let i = 0; i < 20; i++) {
		model.fit()
	}
	const y = model.predict()
	const q = coRankingMatrix(x, y, 20, 20)
	expect(q).toBeGreaterThan(0.9)
})
