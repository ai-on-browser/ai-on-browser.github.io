import { KNN, KNNRegression } from '../../../lib/model/knearestneighbor.js'
import { Matrix } from '../../../lib/util/math.js'

test.each(['euclid', 'manhattan', 'chebyshev'])('classifier %s', metric => {
	const model = new KNN(5, metric)
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / 50) * 2 - 1
	}
	model.fit(x, t)
	const y = model.predict(x)
	let acc = 0
	for (let i = 0; i < t.length; i++) {
		if (y[i] === t[i]) {
			acc++
		}
	}
	expect(acc / y.length).toBeGreaterThan(0.95)
})

test.each(['euclid', 'manhattan', 'chebyshev'])('regression %s', metric => {
	const model = new KNNRegression(1, metric)
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = x[i][0] + x[i][1] + (Math.random() - 0.5) / 10
	}
	model.fit(x, t)
	const y = model.predict(x)
	for (let i = 0; i < 4; i++) {
		expect(y[i]).toBe(t[i])
	}
})
