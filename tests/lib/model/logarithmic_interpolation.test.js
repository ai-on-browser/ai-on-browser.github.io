import Matrix from '../../../lib/util/matrix.js'
import LogarithmicInterpolation from '../../../lib/model/logarithmic_interpolation.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('interpolation', { retry: 3 }, () => {
	const model = new LogarithmicInterpolation()
	const x = Matrix.random(20, 1, -2, 2).value
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.abs(Math.sin(x[i]))
	}
	model.fit(x, t)

	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	for (let i = 0; i < y.length; i++) {
		expect(y[i]).toBeCloseTo(t[i])
	}

	const x0 = Matrix.random(100, 1, -2, 2).value
	const y0 = model.predict(x0)
	const err = rmse(
		y0,
		x0.map(v => Math.abs(Math.sin(v)))
	)
	expect(err).toBeLessThan(0.2)
})
