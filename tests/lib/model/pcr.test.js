import { Matrix } from '../../../lib/util/math.js'
import PCR from '../../../lib/model/pcr.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('regression', () => {
	const model = new PCR()
	const n = 50
	const x = Matrix.randn(n, 5, 0, Matrix.diag([1.0, 0.1, 0.8, 0.1, 0.1]))
		.concat(Matrix.randn(n, 5, [5, 0, 5, 0, 0], Matrix.diag([1.0, 0.1, 0.8, 0.1, 0.1])))
		.toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + x[i][2] + (Math.random() - 0.5) / 100]
	}
	model.fit(x, t)

	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})
