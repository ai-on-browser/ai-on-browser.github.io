import { rmse } from '../../../lib/evaluate/regression.js'
import LeastSquare from '../../../lib/model/least_square.js'
import Matrix from '../../../lib/util/matrix.js'

test('fit', () => {
	const model = new LeastSquare()
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10 + 5]
	}
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})

test('same bias column', () => {
	const model = new LeastSquare()
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10 + 5]
	}
	model.fit(x, t)
	const y = model.predict(x)

	const x2 = Matrix.resize(Matrix.fromArray(x), x.length, x[0].length + 1, 1)
	const t2 = Matrix.fromArray(t)
	const w = x2.tDot(x2).solve(x2.tDot(t2))
	const y2 = x2.dot(w)

	for (let i = 0; i < y.length; i++) {
		for (let j = 0; j < y[i].length; j++) {
			expect(y[i][j]).toBeCloseTo(y2.at(i, j))
		}
	}
	for (let i = 0; i < 2; i++) {
		expect(model._w.at(i, 0)).toBeCloseTo(w.at(i, 0))
	}
})
