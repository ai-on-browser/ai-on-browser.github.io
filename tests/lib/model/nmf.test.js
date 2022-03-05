import Matrix from '../../../lib/util/matrix.js'
import NMF from '../../../lib/model/nmf.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('dimensionality reduction', () => {
	const x = Matrix.concat(Matrix.random(50, 5, 0, 2), Matrix.random(50, 5, 5, 8)).toArray()
	const model = new NMF()

	model.init(x, 2)
	for (let i = 0; i < 100; i++) {
		model.fit()
	}
	const y = model.predict()
	const q = coRankingMatrix(x, y, 30, 20)
	expect(q).toBeGreaterThan(0.9)
})
