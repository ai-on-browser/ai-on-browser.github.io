import Matrix from '../../../lib/util/matrix.js'
import IncrementalPCA from '../../../lib/model/incremental_pca.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

describe('dimensionality reduction', () => {
	test('to 2d', () => {
		const x = Matrix.concat(Matrix.randn(50, 5, 0, 0.2), Matrix.randn(50, 5, 5, 0.2)).toArray()
		const model = new IncrementalPCA(undefined, 2)
		model.fit(x)

		const y = model.predict(x)
		expect(y[0]).toHaveLength(2)
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})

	test('0', () => {
		const x = Matrix.concat(Matrix.randn(50, 5, 0, 0.2), Matrix.randn(50, 5, 5, 0.2)).toArray()
		const model = new IncrementalPCA()
		model.fit(x)

		const y = model.predict(x)
		expect(y[0]).toHaveLength(5)
		const q = coRankingMatrix(x, y, 30, 20)
		expect(q).toBeGreaterThan(0.9)
	})

	test('fit twice', () => {
		const x = [
			[0, 0],
			[1, 1],
		]
		const model = new IncrementalPCA()
		model.fit(x)
		model.fit(x)

		const y = model.predict(x)
		expect(y[0]).toHaveLength(2)
	})
})
