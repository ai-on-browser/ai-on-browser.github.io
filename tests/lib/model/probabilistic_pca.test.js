import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import ProbabilisticPCA from '../../../lib/model/probabilistic_pca.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('ppca analysis', () => {
	const model = new ProbabilisticPCA('analysis', 9)
	const x = Matrix.randn(300, 10, 0, Matrix.diag([1.0, 0.1, 1.0, 0.1, 0.1, 0.1, 0.1, 0.1, 1.0, 0.1])).toArray()

	model.fit(x)
	const y = model.predict(x)
	const q = coRankingMatrix(x, y, 30, 20)
	expect(q).toBeGreaterThan(0.9)
})

test.each(['em', 'bayes'])('ppca %s', method => {
	const model = new ProbabilisticPCA(method, 8)
	const x = Matrix.randn(300, 10, 0, Matrix.diag([1.0, 0.1, 1.0, 0.1, 0.1, 0.1, 0.1, 0.1, 1.0, 0.1])).toArray()

	for (let i = 0; i < 100; i++) {
		model.fit(x)
	}
	const y = model.predict(x)
	const q = coRankingMatrix(x, y, 30, 20)
	expect(q).toBeGreaterThan(0.9)
})
