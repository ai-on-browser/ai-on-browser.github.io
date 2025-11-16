import Matrix from '../../../lib/util/matrix.js'
import { SNE, tSNE } from '../../../lib/model/tsne.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

describe('SNE dimension reduction', () => {
	test.each([undefined, 1, 2])('%j', { retry: 3 }, d => {
		const x = Matrix.concat(Matrix.randn(20, 5, 0, 0.2), Matrix.randn(20, 5, 5, 0.2)).toArray()
		const model = new SNE(x, d)
		model._perplexity = 30

		for (let i = 0; i < 20; i++) {
			model.fit()
		}
		const y = model.predict()
		const q = coRankingMatrix(x, y, 10, 10)
		expect(q).toBeGreaterThan(0.9)
	})

	test('infinite sigma', () => {
		const x = [
			[0, 0],
			[1, 1],
		]
		const model = new SNE(x, 1)

		model.fit()
		const y = model.predict()
		expect(y).toHaveLength(2)
	})
})

describe('tSNE dimension reduction', () => {
	test.each([undefined, 1, 2])('%j', d => {
		const x = Matrix.concat(Matrix.randn(20, 5, 0, 0.2), Matrix.randn(20, 5, 5, 0.2)).toArray()
		const model = new tSNE(x, d)

		for (let i = 0; i < 20; i++) {
			model.fit()
		}
		const y = model.predict()
		const q = coRankingMatrix(x, y, 10, 10)
		expect(q).toBeGreaterThan(0.9)
	})

	test('infinite sigma', () => {
		const x = [
			[0, 0],
			[1, 1],
		]
		const model = new tSNE(x, 1)

		model.fit()
		const y = model.predict()
		expect(y).toHaveLength(2)
	})
})
