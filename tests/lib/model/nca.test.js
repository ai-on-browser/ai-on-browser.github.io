import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import NeighbourhoodComponentsAnalysis from '../../../lib/model/nca.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

describe('dimensionality reduction', () => {
	test('default', () => {
		const model = new NeighbourhoodComponentsAnalysis()
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}

		for (let i = 0; i < 2; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})

	test('d: 3', () => {
		const model = new NeighbourhoodComponentsAnalysis(3)
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}

		model.fit(x, t)
		const y = model.predict(x)
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})
})

test('importance', () => {
	const model = new NeighbourhoodComponentsAnalysis(3)
	const n = 50
	const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}

	model.fit(x, t)

	const importance = model.importance()
	expect(importance).toHaveLength(2)
})
