import { randIndex } from '../../../lib/evaluate/clustering.js'
import SpectralClustering from '../../../lib/model/spectral.js'
import Matrix from '../../../lib/util/matrix.js'

test.each([undefined, 'rbf', { name: 'rbf', sigma: 0.5 }, { name: 'knn', k: 4 }])('clustering %j', affinity => {
	const model = new SpectralClustering(affinity)
	const n = 5
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
		Matrix.randn(n, 2, [0, 5], 0.1)
	).toArray()

	model.init(x)
	model.add()
	model.add()
	model.add()
	for (let i = 0; i < 20; i++) {
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

test('clear', () => {
	const model = new SpectralClustering()
	const n = 5
	const x = Matrix.randn(n, 2, 0, 0.1).toArray()

	model.init(x)
	model.add()
	model.add()
	model.fit()
	expect(model.size).toBe(2)
	expect(model.epoch).toBe(1)
	model.clear()
	expect(model.size).toBe(0)
	expect(model.epoch).toBe(0)
})
