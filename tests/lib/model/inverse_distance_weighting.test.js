import Matrix from '../../../lib/util/matrix.js'
import InverseDistanceWeighting from '../../../lib/model/inverse_distance_weighting.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('default', () => {
	const model = new InverseDistanceWeighting()
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})

test.each([undefined, 'euclid', 'manhattan', 'chebyshev', 'minkowski'])('fit %s', metric => {
	const model = new InverseDistanceWeighting(5, 2, metric)
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})

test('interpolation', () => {
	const model = new InverseDistanceWeighting(5, 1)
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
	)
	expect(err).toBeLessThan(0.5)
})
