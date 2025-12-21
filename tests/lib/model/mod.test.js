import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'
import MOD from '../../../lib/model/mod.js'
import Matrix from '../../../lib/util/matrix.js'

test('dimensionality reduction', { retry: 3 }, () => {
	const x = Matrix.concat(Matrix.randn(50, 5, 0, 0.2), Matrix.randn(50, 5, 5, 0.2)).toArray()
	const model = new MOD(x, 2)

	for (let i = 0; i < 10; i++) {
		model.fit()
	}
	const y = model.predict()
	const q = coRankingMatrix(x, y, 30, 20)
	expect(q).toBeGreaterThan(0.9)
})

test('dimensionality reduction small norm', () => {
	const x = [[0, 0, 0, 0, 0]]
	const model = new MOD(x, 2)

	model.fit()
	const y = model.predict()
	expect(y).toEqual([[0, 0]])
})
