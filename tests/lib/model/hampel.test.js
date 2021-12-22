import HampelFilter from '../../../lib/model/hampel.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('smoothing', () => {
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = [Math.sin(i / 20) + (Math.random() - 0.5) / 2]
		t[i] = [Math.sin(i / 20)]
	}
	const model = new HampelFilter(5, 0.1)
	const y = model.predict(x)
	expect(y).toHaveLength(t.length)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(rmse(x, t)[0])
})
