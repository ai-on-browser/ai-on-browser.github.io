import { randIndex } from '../../../lib/evaluate/clustering.js'
import GeneticKMeans from '../../../lib/model/genetic_kmeans.js'
import Matrix from '../../../lib/util/matrix.js'

test('predict', () => {
	const model = new GeneticKMeans(2, 10)
	const n = 50
	const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

	model.init(x)
	for (let i = 0; i < 20; i++) {
		model.fit()
	}
	expect(model.centroids).toHaveLength(2)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
