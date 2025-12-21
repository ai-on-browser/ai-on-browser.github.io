import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'
import MDS from '../../../lib/model/mds.js'
import Matrix from '../../../lib/util/matrix.js'

describe('dimensionality reduction', () => {
	test('default', () => {
		const x = Matrix.randn(50, 5, 0, 0.2).toArray()

		const y = new MDS().predict(x)
		expect(y[0]).toHaveLength(5)
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})

	test('data', () => {
		const x = Matrix.randn(50, 5, 0, 0.2).toArray()

		const y = new MDS(2).predict(x)
		expect(y[0]).toHaveLength(2)
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})

	test('distance matrix', () => {
		const x = Matrix.randn(50, 5, 0, 0.2).toArray()
		const d = []
		for (let i = 0; i < x.length; i++) {
			d[i] = []
			d[i][i] = 0
			for (let j = 0; j < i; j++) {
				d[i][j] = d[j][i] = Math.sqrt(x[i].reduce((s, v, k) => s + (v - x[j][k]) ** 2, 0))
			}
		}

		const y = new MDS(2).predict(d, true)
		expect(y[0]).toHaveLength(2)
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})
})
