import Matrix from '../../../lib/util/matrix.js'
import SpectralClustering from '../../../lib/model/spectral.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('clustering', () => {
	const model = new SpectralClustering()
	const n = 5
	const x = Matrix.randn(n, 2, 0, 0.1)
		.concat(Matrix.randn(n, 2, 5, 0.1))
		.concat(Matrix.randn(n, 2, [0, 5], 0.1))
		.toArray()

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
