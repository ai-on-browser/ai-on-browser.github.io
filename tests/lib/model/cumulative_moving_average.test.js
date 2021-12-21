import cumulativeMovingAverage from '../../../lib/model/cumulative_moving_average.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('smoothing', () => {
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = [Math.sin(i / 20) + (Math.random() - 0.5) / 2]
		t[i] = [Math.sin(i / 20)]
	}
	const y = cumulativeMovingAverage(x)
	expect(y).toHaveLength(t.length)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.8)
})
