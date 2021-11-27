import { Matrix } from '../../../lib/util/math.js'
import WeightedLeastSquares from '../../../lib/model/weighted_least_squares.js'

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
	let err = 0
	for (let i = 0; i < t.length; i++) {
		err += (y[i][0] - t[i][0]) ** 2
	}
	expect(Math.sqrt(err / t.length)).toBeLessThan(0.5)
})
