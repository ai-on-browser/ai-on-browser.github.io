import Matrix from '../../../lib/util/matrix.js'
import IsotonicRegression from '../../../lib/model/isotonic.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('fit', () => {
	const model = new IsotonicRegression()
	const x = Matrix.random(50, 1, 0, 5).value
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = x[i] + (Math.random() - 0.5) / 10
	}
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(y, t)
	expect(err).toBeLessThan(0.5)
})
