import { rmse } from '../../../lib/evaluate/regression.js'
import IsotonicRegression from '../../../lib/model/isotonic.js'
import Matrix from '../../../lib/util/matrix.js'

test('fit', () => {
	const model = new IsotonicRegression()
	const x = Matrix.random(50, 1, 0, 5).value
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = x[i] + (Math.random() - 0.5) / 10
	}
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(y, t)
	expect(err).toBeLessThan(0.5)
})

test('fit c not match', () => {
	const model = new IsotonicRegression()
	const x = [0.0, 1.2, 1.5, 1.1]
	const t = [0.0, 1.4, 1.3, 1.6]
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(y, t)
	expect(err).toBeLessThan(1.0)
})
