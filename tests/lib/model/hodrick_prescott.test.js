import { rmse } from '../../../lib/evaluate/regression.js'
import HodrickPrescottFilter from '../../../lib/model/hodrick_prescott.js'

test('Hodrick-Prescott filter', () => {
	const x = []
	const t = []
	for (let i = 0; i < 300; i++) {
		x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 2
		t[i] = Math.sin(i / 20)
	}
	const y = new HodrickPrescottFilter(100).predict(x)
	expect(y).toHaveLength(t.length)
	const err = rmse(y, t)
	expect(err).toBeLessThan(rmse(x, t))
})
