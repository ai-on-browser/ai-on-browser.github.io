import { ExponentialMovingAverage, ModifiedMovingAverage } from '../../../lib/model/exponential_average.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('exponentialMovingAverage', () => {
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 2
		t[i] = Math.sin(i / 20)
	}
	const y = new ExponentialMovingAverage().predict(x, 5)
	expect(y).toHaveLength(t.length)
	const err = rmse(y, t)
	expect(err).toBeLessThan(rmse(x, t))
})

test('modifiedMovingAverage', () => {
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 2
		t[i] = Math.sin(i / 20)
	}
	const y = new ModifiedMovingAverage().predict(x, 3)
	expect(y).toHaveLength(t.length)
	const err = rmse(y, t)
	expect(err).toBeLessThan(rmse(x, t))
})
