import movingMedian from '../../../lib/model/moving_median.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('smoothing', () => {
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = [Math.sin(i / 20) + (Math.random() - 0.5) / 2]
		t[i] = [Math.sin(i / 20)]
	}
	const y = movingMedian(x, 3)
	expect(y).toHaveLength(t.length)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(rmse(x, t)[0])
})
