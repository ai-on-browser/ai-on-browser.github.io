import Matrix from '../../../lib/util/matrix.js'
import QuantileRegression from '../../../lib/model/quantile_regression.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('fit', () => {
	const model = new QuantileRegression(0.5, 0.0001)
	const x = Matrix.random(100, 2, -2, 2).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	for (let i = 0; i < 1000; i++) {
		model.fit(x, t)
	}
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})
