import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'
import RandomProjection from '../../../lib/model/random_projection.js'
import Matrix from '../../../lib/util/matrix.js'

describe('dimensionality reduction', () => {
	test('project', () => {
		const x = Matrix.concat(Matrix.randn(50, 5, 0, 0.2), Matrix.randn(50, 5, 5, 0.2)).toArray()
		const y = new RandomProjection().predict(x)
		expect(y[0]).toHaveLength(5)
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})

	test.each([undefined, 'uniform', 'normal', 'root3'])('%s', { retry: 3 }, method => {
		const x = Matrix.concat(Matrix.randn(50, 5, 0, 0.2), Matrix.randn(50, 5, 5, 0.2)).toArray()
		const y = new RandomProjection(method, 2).predict(x)
		expect(y[0]).toHaveLength(2)
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})
})
