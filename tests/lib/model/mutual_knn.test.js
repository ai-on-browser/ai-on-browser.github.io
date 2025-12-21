import { randIndex } from '../../../lib/evaluate/clustering.js'
import MutualKNN from '../../../lib/model/mutual_knn.js'
import Matrix from '../../../lib/util/matrix.js'

describe('clustering', () => {
	test('default', { retry: 3 }, () => {
		const model = new MutualKNN()
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [-1, 5], 0.1)
		).toArray()

		model.fit(x)
		expect(model.size).toBeGreaterThanOrEqual(3)
		const y = model.predict()
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.8)
	})

	test('k: 10', { retry: 3 }, () => {
		const model = new MutualKNN(10)
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [-1, 5], 0.1)
		).toArray()

		model.fit(x)
		expect(model.size).toBeGreaterThanOrEqual(3)
		const y = model.predict()
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})
})
