import { rmse } from '../../../lib/evaluate/regression.js'
import PoissonRegression from '../../../lib/model/poisson.js'
import Matrix from '../../../lib/util/matrix.js'

test('fit', { retry: 3 }, () => {
	const model = new PoissonRegression(0.1)
	const x = Matrix.random(50, 2, 0, 2).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [Math.exp(x[i][0]) + (Math.random() - 0.5) / 10]
	}
	for (let i = 0; i < 100; i++) {
		model.fit(x, t)
	}
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})
