import { rmse } from '../../../lib/evaluate/regression.js'
import PriestleyChao from '../../../lib/model/priestley_chao.js'
import Matrix from '../../../lib/util/matrix.js'

test.each([undefined, 0.25])('fit %P', h => {
	const model = new PriestleyChao(h)
	const x = Matrix.random(100, 1, -2, 2).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + (Math.random() - 0.5) / 10]
	}
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(
		y,
		t.map(v => v[0])
	)
	expect(err).toBeLessThan(0.5)
})
