import { rmse } from '../../../lib/evaluate/regression.js'
import WeightedLeastSquares from '../../../lib/model/weighted_least_squares.js'
import Matrix from '../../../lib/util/matrix.js'

test('fit', () => {
	const model = new WeightedLeastSquares()
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	const w = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		w[i] = Math.random()
	}
	model.fit(x, t, w)
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})
