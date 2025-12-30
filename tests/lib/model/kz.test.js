import { rmse } from '../../../lib/evaluate/regression.js'
import KolmogorovZurbenkoFilter from '../../../lib/model/kz.js'

test('smoothing', () => {
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 2
		t[i] = Math.sin(i / 20)
	}
	const model = new KolmogorovZurbenkoFilter(5, 2)
	const y = model.predict(x)
	expect(y).toHaveLength(t.length)
	const err = rmse(y, t)
	expect(err).toBeLessThan(rmse(x, t))
})
