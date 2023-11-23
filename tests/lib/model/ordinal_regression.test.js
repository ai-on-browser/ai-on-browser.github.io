import Matrix from '../../../lib/util/matrix.js'
import OrdinalRegression from '../../../lib/model/ordinal_regression.js'

import { rmse } from '../../../lib/evaluate/regression.js'

describe('ordinal', () => {
	test('fit', () => {
		const model = new OrdinalRegression()
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 2, 0.2)),
			Matrix.randn(50, 2, 4, 0.2)
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
