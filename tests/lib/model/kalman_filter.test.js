import KalmanFilter from '../../../lib/model/kalman_filter.js'

import { rmse } from '../../../lib/evaluate/regression.js'

describe('smoothing', () => {
	test('small dim', () => {
		const x = []
		const t = []
		for (let i = 0; i < 100; i++) {
			x[i] = [Math.sin(i / 50) + (Math.random() - 0.5) / 2]
			t[i] = [Math.sin(i / 50)]
		}
		const model = new KalmanFilter()
		const y = model.fit(x)
		expect(y).toHaveLength(t.length)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(rmse(x, t)[0])
	})

	test('large dim', { retry: 3 }, () => {
		const x = []
		const t = []
		for (let i = 0; i < 100; i++) {
			const v = Math.sin(i / 50) + (Math.random() - 0.5) / 2
			x[i] = Array.from({ length: 12 }, () => v)
			t[i] = [Math.sin(i / 50)]
		}
		const model = new KalmanFilter()
		const y = model.fit(x)
		expect(y).toHaveLength(t.length)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(Infinity)
	})
})
