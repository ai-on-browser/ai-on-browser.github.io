import { accuracy } from '../../../lib/evaluate/classification.js'
import { rmse } from '../../../lib/evaluate/regression.js'
import {
	RadiusNeighbor,
	RadiusNeighborRegression,
	SemiSupervisedRadiusNeighbor,
} from '../../../lib/model/radius_neighbor.js'
import Matrix from '../../../lib/util/matrix.js'

describe('classifier', () => {
	test('default', () => {
		const model = new RadiusNeighbor()
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

	test.each([
		undefined,
		'euclid',
		'manhattan',
		'chebyshev',
		'minkowski',
		(a, b) => a.reduce((s, v, i) => s + Math.exp((v - b[i]) ** 2) - 1, 0),
	])('%s', metric => {
		const model = new RadiusNeighbor(0.2, metric)
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

	test('same count', () => {
		const model = new RadiusNeighbor()
		model.fit(
			[
				[1, 0],
				[0, 1],
			],
			['a', 'b']
		)
		const y = model.predict([
			[0.1, 0.2],
			[0.2, 0.1],
		])
		expect(y[0]).toBe('b')
		expect(y[1]).toBe('a')
	})
})

describe('regression', () => {
	test('default', () => {
		const model = new RadiusNeighborRegression()
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

	test.each([
		undefined,
		'euclid',
		'manhattan',
		'chebyshev',
		'minkowski',
		(a, b) => a.reduce((s, v, i) => s + Math.exp((v - b[i]) ** 2) - 1, 0),
	])('%s', metric => {
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

	test('outlier', () => {
		const model = new RadiusNeighborRegression()
		const x = Matrix.randn(50, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = x[i][0] + x[i][1] + (Math.random() - 0.5) / 10
		}
		model.fit(x, t)
		const y = model.predict([[100, 100]])
		expect(y[0]).toBeNull()
	})
})

describe('semi-classifier', () => {
	test('default', () => {
		const model = new SemiSupervisedRadiusNeighbor()
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

	test.each([
		undefined,
		'euclid',
		'manhattan',
		'chebyshev',
		'minkowski',
		(a, b) => a.reduce((s, v, i) => s + Math.exp((v - b[i]) ** 2) - 1, 0),
	])('%s', { retry: 3 }, metric => {
		const model = new SemiSupervisedRadiusNeighbor(0.5, metric)
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
