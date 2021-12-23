import { Matrix } from '../../../lib/util/math.js'
import PLS from '../../../lib/model/pls.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('regression', () => {
	const model = new PLS(3)
	const x = Matrix.randn(50, 5, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 100]
	}
	model.init(x, t)
	model.fit(x, t)

	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})
