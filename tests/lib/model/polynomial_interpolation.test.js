import { Matrix } from '../../../lib/util/math.js'
import PolynomialInterpolation from '../../../lib/model/polynomial_interpolation.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('interpolation', () => {
	const model = new PolynomialInterpolation()
	const x = Matrix.random(20, 1, -2, 2).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [Math.sin(x[i])]
	}
	model.fit(x, t)

	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	for (let i = 0; i < y.length; i++) {
		expect(y[i][0]).toBeCloseTo(t[i][0])
	}

	const x0 = Matrix.random(100, 1, -2, 2).toArray()
	const y0 = model.predict(x0)
	const err = rmse(
		y0,
		x0.map(v => [Math.sin(v[0])])
	)[0]
	expect(err).toBeLessThan(0.1)
})
