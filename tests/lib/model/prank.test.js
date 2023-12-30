import Matrix from '../../../lib/util/matrix.js'
import PRank from '../../../lib/model/prank.js'

import { rmse } from '../../../lib/evaluate/regression.js'

describe('ordinal', () => {
	test('fit', () => {
		const model = new PRank()
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(50, 2, -5, 0.2), Matrix.randn(50, 2, 0, 0.2)),
			Matrix.concat(Matrix.randn(50, 2, 5, 0.2), Matrix.randn(50, 2, 10, 0.2))
		).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50)
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const err = rmse(y, t)
		expect(err).toBeLessThan(0.5)
	})
})
