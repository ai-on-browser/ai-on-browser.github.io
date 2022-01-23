import Matrix from '../../../lib/util/matrix.js'
import CubicHermiteSpline from '../../../lib/model/cubic_hermite_spline.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('interpolation', () => {
	const model = new CubicHermiteSpline(0, 0)
	const x = Matrix.random(50, 1, -2, 2).value
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.sin(x[i])
	}
	model.fit(x, t)

	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	for (let i = 0; i < y.length; i++) {
		expect(y[i]).toBeCloseTo(t[i])
	}

	const x0 = Matrix.random(100, 1, -2, 2).value
	const y0 = model.predict(x0)
	const err = rmse(y0, x0.map(Math.sin))
	expect(err).toBeLessThan(0.1)
})
