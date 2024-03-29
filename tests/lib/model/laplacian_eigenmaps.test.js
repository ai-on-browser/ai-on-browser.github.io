import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import LaplacianEigenmaps from '../../../lib/model/laplacian_eigenmaps.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

describe.each([undefined, 'knn'])('dimensionality reduction affinity:%p', affinity => {
	test.each([undefined, 'normalized'])('laplacian: %p', laplacian => {
		const x = Matrix.concat(Matrix.randn(30, 5, 0, 0.2), Matrix.randn(30, 5, 5, 0.2)).toArray()
		const model = new LaplacianEigenmaps(2, affinity, undefined, undefined, laplacian)

		const y = model.predict(x)
		expect(y[0]).toHaveLength(2)
		const q = coRankingMatrix(x, y, 20, 20)
		expect(q).toBeGreaterThan(0.9)
	})
})
