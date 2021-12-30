import { jest } from '@jest/globals'
jest.retryTimes(3)

import { Matrix } from '../../../lib/util/math.js'
import DiffusionMap from '../../../lib/model/diffusion_map.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('dimensionality reduction', () => {
	const x = Matrix.random(50, 5, -2, 1).concat(Matrix.random(50, 5, 3, 5)).toArray()

	const y = new DiffusionMap(5).predict(x, 2)
	const q = coRankingMatrix(x, y, 20, 20)
	expect(q).toBeGreaterThan(0.9)
})
