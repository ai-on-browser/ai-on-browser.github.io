import { jest } from '@jest/globals'
jest.retryTimes(3)

import {
	RadiusNeighbor,
	RadiusNeighborRegression,
	SemiSupervisedRadiusNeighbor,
} from '../../../lib/model/radius_neighbor.js'
import Matrix from '../../../lib/util/matrix.js'

import { accuracy } from '../../../lib/evaluate/classification.js'
import { rmse } from '../../../lib/evaluate/regression.js'

test.each(['euclid', 'manhattan', 'chebyshev'])('classifier %s', metric => {
	const model = new RadiusNeighbor(0.2, metric)
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
	}
	model.fit(x, t)
	const y = model.predict(x)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
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
	const err = rmse(y, t)
	expect(err).toBeLessThan(0.5)
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
	const acc = accuracy(y, t_org)
	expect(acc).toBeGreaterThan(0.95)
})
