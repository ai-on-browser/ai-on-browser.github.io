import { jest } from '@jest/globals'
jest.retryTimes(5)

import { Matrix } from '../../../lib/util/math.js'
import UMAP from '../../../lib/model/umap.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('dimensionality reduction', () => {
	const x = Matrix.randn(50, 10, 0, 0.2).concat(Matrix.randn(50, 10, 5, 0.2)).toArray()
	const model = new UMAP(x, 2, 2, 0.2)

	for (let i = 0; i < 100; i++) {
		model.fit()
	}
	const y = model.predict()
	const q = coRankingMatrix(x, y, 20, 20)
	expect(q).toBeGreaterThan(0.9)
})
