import { rmse } from '../../../lib/evaluate/regression.js'
import PassingBablok from '../../../lib/model/passing_bablok.js'
import Matrix from '../../../lib/util/matrix.js'

test.each([50, 49])('fit n:%j', n => {
	const model = new PassingBablok()
	const x = Matrix.randn(n, 1, 0, 5).value
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = x[i] + (Math.random() - 0.5) / 10
	}
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(y, t)
	expect(err).toBeLessThan(0.5)
})
