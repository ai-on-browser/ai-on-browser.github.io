import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import LatentDirichletAllocation from '../../../lib/model/latent_dirichlet_allocation.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('lda', () => {
	const model = new LatentDirichletAllocation(2)
	const n = 50
	const x = Matrix.map(Matrix.concat(Matrix.random(n, 10, 0, 5), Matrix.random(n, 10, 4, 9)), v =>
		String.fromCharCode('a'.charCodeAt(0) + v)
	).toArray()

	model.init(x)
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
