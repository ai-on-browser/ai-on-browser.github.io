import Matrix from '../../../lib/util/matrix.js'
import LeastTrimmedSquaresRegression from '../../../lib/model/lts.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('fit', () => {
	const model = new LeastTrimmedSquaresRegression()
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})

test('same bias column', () => {
	const model = new LeastTrimmedSquaresRegression()
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	model.fit(x, t)
	const y = model.predict(x)

	const x2 = Matrix.resize(Matrix.fromArray(x), x.length, x[0].length + 1, 1)
	const t2 = Matrix.fromArray(t)
	const d = Matrix.sub(t2, x2.dot(x2.tDot(x2).solve(x2.tDot(t2))))
	d.map(v => v ** 2)
	const r = d.sum(1).value.map((v, i) => [v, i])
	r.sort((a, b) => a[0] - b[0])

	const h = 45
	const xlts = x2.row(r.slice(0, h).map(v => v[1]))
	const ylts = t2.row(r.slice(0, h).map(v => v[1]))
	const w = xlts.tDot(xlts).solve(xlts.tDot(ylts))
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
