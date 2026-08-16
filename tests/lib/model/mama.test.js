import { rmse } from '../../../lib/evaluate/regression.js'
import MAMA from '../../../lib/model/mama.js'

test('smoothing', () => {
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 2
		t[i] = Math.sin(i / 20)
	}
	const y = new MAMA(0.9, 0.8).predict(x)
	expect(y.mama).toHaveLength(t.length)
	expect(y.fama).toHaveLength(t.length)
	const errMama = rmse(y.mama, t)
	expect(errMama).toBeLessThan(0.2)
	const errFama = rmse(y.fama, t)
	expect(errFama).toBeLessThan(0.5)
})
