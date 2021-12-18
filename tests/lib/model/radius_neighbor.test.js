import {
	RadiusNeighbor,
	RadiusNeighborRegression,
	SemiSupervisedRadiusNeighbor,
} from '../../../lib/model/radius_neighbor.js'
import { Matrix } from '../../../lib/util/math.js'

test.each(['euclid', 'manhattan', 'chebyshev'])('classifier %s', metric => {
	const model = new RadiusNeighbor(0.2, metric)
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
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
	const model = new RadiusNeighborRegression(0.1, metric)
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

test.each(['euclid', 'manhattan', 'chebyshev'])('semi-classifier %s', metric => {
	const model = new SemiSupervisedRadiusNeighbor(0.5, metric)
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	const t_org = []
	for (let i = 0; i < x.length; i++) {
		t_org[i] = t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
		if (Math.random() < 0.5) {
			t[i] = null
		}
	}
	model.fit(x, t)
	const y = model.predict(x)
	let acc = 0
	for (let i = 0; i < t.length; i++) {
		if (y[i] === t_org[i]) {
			acc++
		}
	}
	expect(acc / y.length).toBeGreaterThan(0.95)
})
