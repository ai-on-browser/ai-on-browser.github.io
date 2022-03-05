import Matrix from '../../../lib/util/matrix.js'
import PrincipalCurve from '../../../lib/model/principal_curve.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('dimensionality reduction', () => {
	const x = Matrix.concat(Matrix.randn(50, 5, 0, 0.2), Matrix.randn(50, 5, 5, 0.2)).toArray()
	const model = new PrincipalCurve()

	for (let i = 0; i < 10; i++) {
		model.fit(x)
	}
	const y = model.predict()
	const q = coRankingMatrix(x, y, 30, 20)
	expect(q).toBeGreaterThan(0.9)
})
