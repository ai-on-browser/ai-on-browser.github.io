import { jest } from '@jest/globals'
jest.retryTimes(10)

import Matrix from '../../../lib/util/matrix.js'
import DiffusionMap from '../../../lib/model/diffusion_map.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

describe('dimensionality reduction', () => {
	test.each([undefined, 'gaussian', { name: 'gaussian' }])('kernel %p', kernel => {
		const x = Matrix.concat(Matrix.random(40, 5, -2, 1), Matrix.random(40, 5, 3, 5)).toArray()

		const y = new DiffusionMap(3, kernel).predict(x, 2)
		const q = coRankingMatrix(x, y, 20, 20)
		expect(q).toBeGreaterThan(0.9)
	})

	test('custom kernel', () => {
		const x = Matrix.concat(Matrix.random(40, 5, -2, 1), Matrix.random(40, 5, 3, 5)).toArray()

		const y = new DiffusionMap(2, (x, y) => 1 / x.reduce((s, v, i) => s + (v - y[i]) ** 2, 0)).predict(x, 2)
		const q = coRankingMatrix(x, y, 20, 20)
		expect(q).toBeGreaterThan(0.5)
	})
})
