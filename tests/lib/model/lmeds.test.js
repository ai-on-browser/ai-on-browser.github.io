import { rmse } from '../../../lib/evaluate/regression.js'
import LeastMedianSquaresRegression from '../../../lib/model/lmeds.js'
import Matrix from '../../../lib/util/matrix.js'

test.each([50, 49])('fit n:%j', n => {
	const model = new LeastMedianSquaresRegression()
	const x = Matrix.randn(n, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	for (let i = 0; i < 100; i++) {
		model.fit(x, t)
	}
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})
