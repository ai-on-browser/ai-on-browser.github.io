import { rmse } from '../../../lib/evaluate/regression.js'
import CumulativeMovingAverage from '../../../lib/model/cumulative_moving_average.js'

test('smoothing', () => {
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 2
		t[i] = Math.sin(i / 20)
	}
	const y = new CumulativeMovingAverage().predict(x)
	expect(y).toHaveLength(t.length)
	const err = rmse(y, t)
	expect(err).toBeLessThan(0.8)
})
