import { Matrix } from '../../../lib/util/math.js'
import RANSAC from '../../../lib/model/ransac.js'
import { Ridge } from '../../../lib/model/ridge.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('ransac', () => {
	const model = new RANSAC(Ridge)
	const n = 100
	const x = Matrix.randn(n, 2, 0, 5).toArray()
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
