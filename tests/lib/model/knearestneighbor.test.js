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

describe.each([
	undefined,
	'euclid',
	'manhattan',
	'chebyshev',
	'minkowski',
	(a, b) => a.reduce((s, v, i) => s + Math.exp((v - b[i]) ** 2) - 1, 0),
])('classifier %s', metric => {
	test.each([undefined, 5])('k %j', k => {
		const model = new KNN(k, metric)
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

	test('same number of class choice', () => {
		const model = new KNN(2)
		const x = [
			[-1, -1],
			[1, 1],
		]
		const t = ['a', 'b']

		model.fit(x, t)
		const y = model.predict([
			[-1, -1],
			[1, 1],
		])
		expect(y).toEqual(['a', 'b'])
	})
})

describe.each([
	undefined,
	'euclid',
	'manhattan',
	'chebyshev',
	'minkowski',
	(a, b) => a.reduce((s, v, i) => s + Math.exp((v - b[i]) ** 2) - 1, 0),
])('regression %s', metric => {
	test('k 1', () => {
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

	test('k undefined', () => {
		const model = new KNNRegression(undefined, metric)
		const x = Matrix.randn(500, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = x[i][0] + x[i][1]
		}
		model.fit(x, t)
		const y = model.predict(x)
		const err = rmse(y, t)
		expect(err).toBeLessThan(0.5)
	})
})

describe.each([
	undefined,
	'euclid',
	'manhattan',
	'chebyshev',
	'minkowski',
	(a, b) => a.reduce((s, v, i) => s + Math.exp((v - b[i]) ** 2) - 1, 0),
])('semi-classifier %s', metric => {
	test.each([undefined, 5])('k %j', k => {
		const model = new SemiSupervisedKNN(k, metric)
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
})

describe.each([
	undefined,
	'euclid',
	'manhattan',
	'chebyshev',
	'minkowski',
	(a, b) => a.reduce((s, v, i) => s + Math.exp((v - b[i]) ** 2) - 1, 0),
])('anomaly detection %s', metric => {
	test.each([undefined, 5])('k %j', k => {
		const model = new KNNAnomaly(k, metric)
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
})

describe('density estimation', () => {
	describe.each([undefined, 'euclid', 'manhattan', 'chebyshev', 'minkowski'])('%s', metric => {
		test.each([3, 4])('k 50, d%j', { retry: 5 }, d => {
			const model = new KNNDensityEstimation(50, metric)
			const n = 100
			const x = Matrix.concat(Matrix.randn(n, d, 0, 0.1), Matrix.randn(n, d, 5, 0.1)).toArray()

			model.fit(x)
			const y = model.predict(x)
			expect(y).toHaveLength(x.length)

			const p = []
			for (let i = 0; i < x.length; i++) {
				const p1 = Math.exp(-x[i].reduce((s, v) => s + v ** 2, 0) / (2 * 0.1))
				const p2 = Math.exp(-x[i].reduce((s, v) => s + (v - 5) ** 2, 0) / (2 * 0.1))
				p[i] = (p1 + p2) / 2
			}
			const corr = correlation(y, p)
			expect(corr).toBeGreaterThan(0.9)
		})

		test.each([3, 4])('k undefined, d%j', { retry: 5 }, d => {
			const model = new KNNDensityEstimation(undefined, metric)
			const n = 100
			const x = Matrix.concat(Matrix.randn(n, d, 0, 0.1), Matrix.randn(n, d, 5, 0.1)).toArray()

			model.fit(x)
			const y = model.predict(x)
			expect(y).toHaveLength(x.length)

			const p = []
			for (let i = 0; i < x.length; i++) {
				const p1 = Math.exp(-x[i].reduce((s, v) => s + v ** 2, 0) / (2 * 0.1))
				const p2 = Math.exp(-x[i].reduce((s, v) => s + (v - 5) ** 2, 0) / (2 * 0.1))
				p[i] = (p1 + p2) / 2
			}
			const corr = correlation(y, p)
			expect(corr).toBeGreaterThan(0.5)
		})
	})

	describe.each([(a, b) => a.reduce((s, v, i) => s + Math.exp((v - b[i]) ** 2) - 1, 0)])('%s', metric => {
		test.each([3, 4])('k 50, d%j', { retry: 5 }, d => {
			const model = new KNNDensityEstimation(50, metric)
			const n = 100
			const x = Matrix.concat(Matrix.randn(n, d, 0, 0.1), Matrix.randn(n, d, 5, 0.1)).toArray()

			model.fit(x)
			const y = model.predict(x)
			expect(y).toHaveLength(x.length)

			const p = []
			for (let i = 0; i < x.length; i++) {
				const p1 = Math.exp(-x[i].reduce((s, v) => s + v ** 2, 0) / (2 * 0.1))
				const p2 = Math.exp(-x[i].reduce((s, v) => s + (v - 5) ** 2, 0) / (2 * 0.1))
				p[i] = (p1 + p2) / 2
			}
			const corr = correlation(y, p)
			expect(corr).toBeGreaterThan(0.8)
		})

		test.each([3, 4])('k undefined, d%j', { retry: 10 }, d => {
			const model = new KNNDensityEstimation(undefined, metric)
			const n = 100
			const x = Matrix.concat(Matrix.randn(n, d, 0, 0.1), Matrix.randn(n, d, 5, 0.1)).toArray()

			model.fit(x)
			const y = model.predict(x)
			expect(y).toHaveLength(x.length)

			const p = []
			for (let i = 0; i < x.length; i++) {
				const p1 = Math.exp(-x[i].reduce((s, v) => s + v ** 2, 0) / (2 * 0.1))
				const p2 = Math.exp(-x[i].reduce((s, v) => s + (v - 5) ** 2, 0) / (2 * 0.1))
				p[i] = (p1 + p2) / 2
			}
			const corr = correlation(y, p)
			expect(corr).toBeGreaterThan(0.4)
		})
	})
})
