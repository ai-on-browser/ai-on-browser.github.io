import { Matrix } from '../../../lib/util/math.js'
import HuberRegression from '../../../lib/model/huber_regression.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test.each(['rls', 'gd'])('fit %s', method => {
	const model = new HuberRegression(1, method)
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
