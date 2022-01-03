import { Matrix } from '../../../lib/util/math.js'
import DelaunayInterpolation from '../../../lib/model/delaunay_interpolation.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('fit', () => {
	const model = new DelaunayInterpolation()
	const x = [
		[1, 1],
		[-1, 1],
		[1, -1],
		[-1, -1],
	].concat(Matrix.random(10, 2, -1, 1).toArray())
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.abs(x[i][0]) + Math.abs(x[i][1]) + (Math.random() - 0.5) / 100
	}
	model.fit(x, t)
	for (let i = 0; i < x.length; i++) {
		const p = model.predict([x[i]])
		expect(p[0]).toBeCloseTo(t[i])
	}

	const x0 = Matrix.random(200, 2, -1, 1).toArray()
	const y = model.predict(x0)
	const err = rmse(
		y,
		x0.map(v => Math.abs(v[0]) + Math.abs(v[1]))
	)
	expect(err).toBeLessThan(0.5)
})
