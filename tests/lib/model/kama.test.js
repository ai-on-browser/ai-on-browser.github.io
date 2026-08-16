import { rmse } from '../../../lib/evaluate/regression.js'
import KAMA from '../../../lib/model/kama.js'

test('smoothing', () => {
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 2
		t[i] = Math.sin(i / 20)
	}
	const y = new KAMA(10, 2, 30).predict(x)
	expect(y).toHaveLength(t.length)
	console.log(y)
	const err = rmse(y, t)
	expect(err).toBeLessThan(rmse(x, t))
})
