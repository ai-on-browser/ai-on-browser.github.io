import { Matrix } from '../../../lib/util/math.js'
import { tSNE } from '../../../lib/model/tsne.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('tSNE', () => {
	const x = Matrix.randn(20, 5, 0, 0.2).concat(Matrix.randn(20, 5, 5, 0.2)).toArray()
	const model = new tSNE(x, 2)

	for (let i = 0; i < 10; i++) {
		model.fit()
	}
	const y = model.predict()
	const q = coRankingMatrix(x, y, 10, 10)
	expect(q).toBeGreaterThan(0.9)
})
