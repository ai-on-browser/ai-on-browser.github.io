import { rmse } from '../../../lib/evaluate/regression.js'
import PriestleyChao from '../../../lib/model/priestley_chao.js'

test.each([undefined, 0.25])('fit %j', h => {
	const model = new PriestleyChao(h)
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = Math.random() * 4 - 2
		t[i] = x[i] + (Math.random() - 0.5) / 10
	}
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(y, t)
	expect(err).toBeLessThan(0.5)
})
