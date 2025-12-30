import { rmse } from '../../../lib/evaluate/regression.js'
import LanczosInterpolation from '../../../lib/model/lanczos_interpolation.js'

test('interpolation', () => {
	const model = new LanczosInterpolation(2)
	const n = 50
	const x = Array.from({ length: n }, (_, i) => i)
	const t = []
	for (let i = 0; i < n; i++) {
		t[i] = Math.sin(i / 10)
	}
	model.fit(t)

	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	for (let i = 0; i < y.length; i++) {
		expect(y[i]).toBeCloseTo(t[i])
	}

	const x0 = Array.from({ length: n * 4 }, (_, i) => i / 4)
	const y0 = model.predict(x0)
	const err = rmse(
		y0,
		x0.map(v => Math.sin(v / 10))
	)
	expect(err).toBeLessThan(0.2)
})
