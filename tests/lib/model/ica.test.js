import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import ICA from '../../../lib/model/ica.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('dimensionality reduction', () => {
	const x = Matrix.randn(50, 5, 0, Matrix.randn(5, 5).gram().toArray())
		.concat(Matrix.randn(50, 5, 5, Matrix.randn(5, 5).gram().toArray()))
		.toArray()
	const model = new ICA()
	model.fit(x)
	const y = model.predict(x, 2)

	const q = coRankingMatrix(x, y, 30, 20)
	expect(q).toBeGreaterThan(0.9)
})
