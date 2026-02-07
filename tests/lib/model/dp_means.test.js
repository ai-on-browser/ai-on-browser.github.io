import { randIndex } from '../../../lib/evaluate/clustering.js'
import DPMeans from '../../../lib/model/dp_means.js'
import Matrix from '../../../lib/util/matrix.js'

describe('clustering', () => {
	test('default', () => {
		const model = new DPMeans(2.0)
		const n = 20
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		for (let i = 0; i < 3; i++) {
			model.fit(x)
		}
		expect(model.centroids.length).toBeGreaterThanOrEqual(3)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.95)
	})
})
