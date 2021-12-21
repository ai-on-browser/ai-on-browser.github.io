import ChebyshevFilter from '../../../lib/model/chebyshev.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('smoothing', () => {
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = [Math.sin(i / 20) + (Math.random() - 0.5) / 2]
		t[i] = [Math.sin(i / 20)]
	}
	const model = new ChebyshevFilter(1, 0.2, 4, 0.8)
	const y = model.predict(x)
	expect(y).toHaveLength(t.length)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(rmse(x, t)[0])
})
