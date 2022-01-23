import Matrix from '../../../lib/util/matrix.js'
import LpNormLinearRegression from '../../../lib/model/lpnorm_linear.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test.each([undefined, 0.5, 1, 1.5, 2, 3])('fit', p => {
	const model = new LpNormLinearRegression(p)
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
