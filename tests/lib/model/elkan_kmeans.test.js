import { randIndex } from '../../../lib/evaluate/clustering.js'
import ElkanKMeans from '../../../lib/model/elkan_kmeans.js'
import Matrix from '../../../lib/util/matrix.js'

describe('clustering', () => {
	test('default', { retry: 3 }, () => {
		const model = new ElkanKMeans(8)
		const n = 20
		const x = Array.from({ length: 8 }, (_, i) => i * 2)
			.reduce((mat, m) => Matrix.concat(mat, Matrix.randn(n, 2, m, 0.1)), new Matrix(0, 2))
			.toArray()

		model.init(x)
		expect(model.centroids).toHaveLength(8)
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

	test('assign class', () => {
		const model = new ElkanKMeans(2)
		const n = 20
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 0.1, 0.1)).toArray()

		model.init(x)
		for (let i = 0; i < 10; i++) {
			model.fit()
		}
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
	})
})
