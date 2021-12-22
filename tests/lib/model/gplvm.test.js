import { Matrix } from '../../../lib/util/math.js'
import GPLVM from '../../../lib/model/gplvm.js'

import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

test('gplvm', () => {
	const model = new GPLVM(3, 1)
	const x = Matrix.randn(50, 10, 0, Matrix.diag([1.0, 0.1, 1.0, 0.1, 0.1, 0.1, 0.1, 0.1, 1.0, 0.1])).toArray()

	model.init(x)
	for (let i = 0; i < 100; i++) {
		model.fit()
	}
	const y = model.predict()
	const q = coRankingMatrix(x, y, 30, 20)
	expect(q).toBeGreaterThan(0.9)
})
