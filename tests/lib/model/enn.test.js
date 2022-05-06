import Matrix from '../../../lib/util/matrix.js'
import ENN from '../../../lib/model/enn.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe.each([undefined, 0, 1, 2])('version %p', version => {
	test.each([undefined, 'euclid', 'manhattan', 'chebyshev', 'minkowski'])('predict %s', metric => {
		const model = new ENN(version, 5, metric)
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
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
