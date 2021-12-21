import { Matrix } from '../../../lib/util/math.js'
import IncrementalPCA from '../../../lib/model/incremental_pca.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('dimensionality reduction', () => {
	const x = Matrix.randn(50, 5, 0, 0.2).concat(Matrix.randn(50, 5, 5, 0.2)).toArray()
	const model = new IncrementalPCA()
	model.fit(x)

	const y = model.predict(x, 2)
	const q = coRankingMatrix(x, y, 30, 20)
	expect(q).toBeGreaterThan(0.9)
})
