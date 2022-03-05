import { jest } from '@jest/globals'
jest.retryTimes(3)

import {
	KNN,
	KNNRegression,
	SemiSupervisedKNN,
	KNNAnomaly,
	KNNDensityEstimation,
} from '../../../lib/model/knearestneighbor.js'
import Matrix from '../../../lib/util/matrix.js'

import { accuracy } from '../../../lib/evaluate/classification.js'
import { rmse, correlation } from '../../../lib/evaluate/regression.js'

test.each(['euclid', 'manhattan', 'chebyshev'])('classifier %s', metric => {
	const model = new KNN(5, metric)
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
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
	const model = new KNNRegression(1, metric)
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
	const model = new SemiSupervisedKNN(5, metric)
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
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

test.each(['euclid', 'manhattan', 'chebyshev'])('anomaly detection %s', metric => {
	const model = new KNNAnomaly(5, metric)
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	model.fit(x)
	const threshold = 5
	const y = model.predict(x).map(v => v > threshold)
	for (let i = 0; i < y.length - 1; i++) {
		expect(y[i]).toBe(false)
	}
	expect(y[y.length - 1]).toBe(true)
})

test.each(['euclid', 'manhattan', 'chebyshev'])('density estimation %s', metric => {
	const model = new KNNDensityEstimation(50, metric)
	const n = 100
	const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

	model.fit(x)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const p = []
	for (let i = 0; i < x.length; i++) {
		const p1 = Math.exp(-x[i].reduce((s, v) => s + v ** 2, 0) / (2 * 0.1)) / (2 * Math.PI * 0.1)
		const p2 = Math.exp(-x[i].reduce((s, v) => s + (v - 5) ** 2, 0) / (2 * 0.1)) / (2 * Math.PI * 0.1)
		p[i] = (p1 + p2) / 2
	}
	const corr = correlation(y, p)
	expect(corr).toBeGreaterThan(0.9)
})
