import Matrix from '../../../lib/util/matrix.js'
import RepeatedMedianRegression from '../../../lib/model/rmr.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('fit', () => {
	const model = new RepeatedMedianRegression()
	const x = Matrix.randn(50, 1, 0, 5).value
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = x[i] + (Math.random() - 0.5) / 10
	}
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(y, t)
	expect(err).toBeLessThan(0.5)
})
