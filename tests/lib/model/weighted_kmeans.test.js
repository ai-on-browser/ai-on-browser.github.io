import Matrix from '../../../lib/util/matrix.js'
import WeightedKMeans from '../../../lib/model/weighted_kmeans.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('predict', () => {
	const model = new WeightedKMeans(2)
	const n = 50
	const x = Matrix.randn(n, 2, 0, 0.1).concat(Matrix.randn(n, 2, 5, 0.1)).toArray()

	model.add(x)
	model.add(x)
	for (let i = 0; i < 20; i++) {
		const d = model.fit(x)
		if (d === 0) {
			break
		}
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
