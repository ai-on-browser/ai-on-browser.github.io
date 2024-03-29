import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import KernelKMeans from '../../../lib/model/kernel_kmeans.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test.each([undefined, 3])('clustering k: %p', k => {
	const model = new KernelKMeans(k)
	const n = 50
	const x = Matrix.concat(
		Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
		Matrix.randn(n, 2, [-2, 5], 0.1)
	).toArray()

	model.init(x)
	for (let i = 0; i < 10; i++) {
		model.fit()
	}
	const y = model.predict()
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
