import Matrix from '../../../lib/util/matrix.js'
import KHarmonicMeans from '../../../lib/model/kharmonic.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clustering', () => {
	const model = new KHarmonicMeans(3)
	const n = 20
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
		Matrix.randn(n, 2, [0, 5], 0.1)
	).toArray()

	model.init(x)
	expect(model.centroids).toHaveLength(3)
	for (let i = 0; i < 10; i++) {
		model.fit()
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
