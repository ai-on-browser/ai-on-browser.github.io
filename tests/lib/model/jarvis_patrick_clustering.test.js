import { randIndex } from '../../../lib/evaluate/clustering.js'
import JarvisPatrickClustering from '../../../lib/model/jarvis_patrick_clustering.js'
import Matrix from '../../../lib/util/matrix.js'

describe('clustering', () => {
	test.each([undefined, 'euclid', 'manhattan', 'chebyshev'])('%s', { retry: 5 }, metric => {
		const model = new JarvisPatrickClustering(10, 5, metric)
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [-1, 5], 0.1)
		).toArray()

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test.each([(a, b) => a.reduce((s, v, i) => s + Math.exp((v - b[i]) ** 2) - 1, 0)])('%s', { retry: 3 }, metric => {
		const model = new JarvisPatrickClustering(10, 5, metric)
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [-1, 5], 0.1)
		).toArray()

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
