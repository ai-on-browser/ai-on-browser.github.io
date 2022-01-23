import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import RandomProjection from '../../../lib/model/random_projection.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test.each([undefined, 'uniform', 'normal', 'root3'])('dimensionality reduction %s', method => {
	const x = Matrix.randn(50, 5, 0, 0.2).concat(Matrix.randn(50, 5, 5, 0.2)).toArray()
	const y = new RandomProjection(method).predict(x, 2)
	const q = coRankingMatrix(x, y, 30, 20)
	expect(q).toBeGreaterThan(0.9)
})
