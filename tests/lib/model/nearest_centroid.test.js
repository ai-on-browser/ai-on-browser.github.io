import Matrix from '../../../lib/util/matrix.js'
import NearestCentroid from '../../../lib/model/nearest_centroid.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('fit', () => {
	const model = new NearestCentroid()
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
