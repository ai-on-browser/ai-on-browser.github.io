import Matrix from '../../../lib/util/matrix.js'
import WeightedKNN from '../../../lib/model/weighted_knn.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe.each([
	undefined,
	'euclid',
	'manhattan',
	'chebyshev',
	'minkowski',
	(a, b) => a.reduce((s, v, i) => s + Math.exp((v - b[i]) ** 2) - 1, 0),
])('metric %s', metric => {
	test.each([
		undefined,
		'gaussian',
		'rectangular',
		'triangular',
		'epanechnikov',
		'quartic',
		'triweight',
		'cosine',
		'inversion',
	])('predict %s', weight => {
		const model = new WeightedKNN(10, metric, weight)
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 2), Matrix.randn(50, 2, 5, 2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
		}

		model.fit(x, t)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.9)
	})
})
