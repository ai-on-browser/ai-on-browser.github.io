import LanczosInterpolation from '../../../lib/model/lanczos_interpolation.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('interpolation', () => {
	const model = new LanczosInterpolation(2)
	const n = 50
	const x = []
	const t = []
	for (let i = 0; i < n; i++) {
		x[i] = i
		t[i] = Math.sin(i / 10)
	}
	model.fit(t)

	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	for (let i = 0; i < y.length; i++) {
		expect(y[i]).toBeCloseTo(t[i])
	}

	const x0 = []
	for (let i = 0; i < n * 4; i++) {
		x0[i] = i / 4
	}
	const y0 = model.predict(x0)
	const err = rmse(
		y0,
		x0.map(v => Math.sin(v / 10))
	)
	expect(err).toBeLessThan(0.2)
})
