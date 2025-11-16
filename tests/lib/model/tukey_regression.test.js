import Matrix from '../../../lib/util/matrix.js'
import TukeyRegression from '../../../lib/model/tukey_regression.js'

import { rmse } from '../../../lib/evaluate/regression.js'

describe('regression', () => {
	test('fit', { retry: 3 }, () => {
		const model = new TukeyRegression(1)
		const x = Matrix.randn(50, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(0.5)
	})

	test('small tol', { retry: 3 }, () => {
		const model = new TukeyRegression(0.01)
		const x = Matrix.randn(50, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(0.5)
	})
})
