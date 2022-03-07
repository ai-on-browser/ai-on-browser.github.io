import { jest } from '@jest/globals'
jest.retryTimes(10)

import Matrix from '../../../lib/util/matrix.js'
import DiffusionMap from '../../../lib/model/diffusion_map.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('dimensionality reduction', () => {
	const x = Matrix.concat(Matrix.random(50, 5, -2, 1), Matrix.random(50, 5, 3, 5)).toArray()

	const y = new DiffusionMap(5).predict(x, 2)
	const q = coRankingMatrix(x, y, 20, 20)
	expect(q).toBeGreaterThan(0.9)
})
