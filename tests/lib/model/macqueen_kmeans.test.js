import Matrix from '../../../lib/util/matrix.js'
import MacQueenKMeans from '../../../lib/model/macqueen_kmeans.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clustering', () => {
	test('default', { retry: 10 }, () => {
		const model = new MacQueenKMeans(3)
		const n = 20
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 1, 0.1)),
			Matrix.randn(n, 2, [0, 1], 0.1)
		).toArray()

		for (let i = 0; i < 1000; i++) {
			model.fit(x)
		}
		expect(model.centroids).toHaveLength(3)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})
})
