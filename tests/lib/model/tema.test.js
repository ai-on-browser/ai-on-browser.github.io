import { rmse } from '../../../lib/evaluate/regression.js'
import { TEMA } from '../../../lib/model/tema.js'

test('TEMA', () => {
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 2
		t[i] = Math.sin(i / 20)
	}
	const y = new TEMA(5).predict(x)
	expect(y).toHaveLength(t.length)
	const err = rmse(y, t)
	expect(err).toBeLessThan(rmse(x, t))
})
