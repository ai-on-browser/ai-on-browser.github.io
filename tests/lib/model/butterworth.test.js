import ButterworthFilter from '../../../lib/model/butterworth.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('default', () => {
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 2
		t[i] = Math.sin(i / 20)
	}
	const model = new ButterworthFilter()
	const y = model.predict(x)
	expect(y).toHaveLength(t.length)
	const err = rmse(y, t)
	expect(err).toBeLessThan(rmse(x, t))
})

test('smoothing', () => {
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 2
		t[i] = Math.sin(i / 20)
	}
	const model = new ButterworthFilter(2, 0.8)
	const y = model.predict(x)
	expect(y).toHaveLength(t.length)
	const err = rmse(y, t)
	expect(err).toBeLessThan(rmse(x, t))
})
