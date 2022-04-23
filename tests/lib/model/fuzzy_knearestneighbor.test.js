import Matrix from '../../../lib/util/matrix.js'
import FuzzyKNN from '../../../lib/model/fuzzy_knearestneighbor.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('predict', () => {
	const model = new FuzzyKNN()
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
	}

	model.fit(x, t)
	const categories = model.categories
	const y = model.predict(x).map(p => p.reduce((s, v, k) => (s[0] > v ? s : [v, k]), [p[0], 0]))
	expect(y).toHaveLength(x.length)
	const acc = accuracy(
		y.map(v => categories[v[1]]),
		t
	)
	expect(acc).toBeGreaterThan(0.95)
})
