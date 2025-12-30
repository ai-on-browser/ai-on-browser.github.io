import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'
import MLLE from '../../../lib/model/mlle.js'
import Matrix from '../../../lib/util/matrix.js'

describe('dimensionality reduction', () => {
	test('default', { retry: 3 }, () => {
		const x = Matrix.concat(Matrix.randn(30, 5, 0, 0.2), Matrix.randn(30, 5, 5, 0.2)).toArray()
		const y = new MLLE(8).predict(x)
		expect(y[0]).toHaveLength(5)
		const q = coRankingMatrix(x, y, 20, 30)
		expect(q).toBeGreaterThan(0.9)
	})

	test('k: 5', () => {
		const x = Matrix.concat(Matrix.randn(30, 5, 0, 0.2), Matrix.randn(30, 5, 5, 0.2)).toArray()
		const y = new MLLE(5, 2).predict(x)
		expect(y[0]).toHaveLength(2)
		const q = coRankingMatrix(x, y, 20, 30)
		expect(q).toBeGreaterThan(0.9)
	})

	test('odd size and less than eta', () => {
		const x = [
			[-0.48, -0.18, -0.14],
			[0.44, -0.35, 0.08],
			[-0.15, 0.76, 0.11],
			[-0.52, -0.33, 0.12],
			[5.51, 5.27, 5.07],
			[4.63, 4.63, 5.03],
			[4.55, 4.58, 4.66],
			[4.7, 4.5, 5.5],
			[5.53, 4.53, 4.77],
		]
		const y = new MLLE(8).predict(x)
		expect(y[0]).toHaveLength(3)
		const q = coRankingMatrix(x, y, 4, 5)
		expect(q).toBeGreaterThan(0.95)
	})
})
