import Matrix from '../../../lib/util/matrix.js'
import HuberRegression from '../../../lib/model/huber_regression.js'

import { rmse } from '../../../lib/evaluate/regression.js'

describe.each([undefined, 'rls', 'gd'])('fit %s', method => {
	test.each([undefined, 1.0e-5])('e: %j', e => {
		const model = new HuberRegression(e, method)
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
