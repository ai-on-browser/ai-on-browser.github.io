import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'
import UMAP from '../../../lib/model/umap.js'
import Matrix from '../../../lib/util/matrix.js'

describe('dimensionality reduction', () => {
	test('default', { retry: 10 }, () => {
		const x = Matrix.concat(Matrix.randn(50, 10, 0, 0.2), Matrix.randn(50, 10, 5, 0.2)).toArray()
		const model = new UMAP(2)

		model.init(x)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict()
		const q = coRankingMatrix(x, y, 20, 30)
		expect(q).toBeGreaterThan(0.9)
	})

	test('parameter', { retry: 10 }, () => {
		const x = Matrix.concat(Matrix.randn(50, 10, 0, 0.2), Matrix.randn(50, 10, 5, 0.2)).toArray()
		const model = new UMAP(2, 2, 0.2)

		model.init(x)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict()
		const q = coRankingMatrix(x, y, 20, 30)
		expect(q).toBeGreaterThan(0.9)
	})
})
