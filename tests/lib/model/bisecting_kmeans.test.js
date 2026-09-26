import { randIndex } from '../../../lib/evaluate/clustering.js'
import BisectingKMeans from '../../../lib/model/bisecting_kmeans.js'
import Matrix from '../../../lib/util/matrix.js'

describe('clustering', () => {
	test('default', { retry: 3 }, () => {
		const model = new BisectingKMeans()
		const n = 20
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		for (let i = 0; i < 3; i++) {
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

	test('too small cluster', () => {
		const model = new BisectingKMeans()
		const x = [
			[-0.06, -0.24],
			[0.28, -0.11],
			[0.38, -0.17],
			[-0.21, 0.54],
			[4.93, 5.44],
			[4.68, 5.02],
			[4.89, 4.78],
			[5.14, 5.1],
			[-0.01, 4.95],
			[-0.05, 5.03],
			[-0.05, 4.79],
			[0.34, 5.57],
		]

		for (let i = 0; i < 13; i++) {
			model.fit(x)
		}
		expect(model.centroids).toHaveLength(12)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
	})
})
