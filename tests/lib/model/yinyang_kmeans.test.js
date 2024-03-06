import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import YinyangKMeans from '../../../lib/model/yinyang_kmeans.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clustering', () => {
	test('default', () => {
		const model = new YinyangKMeans(20)
		const n = 20
		const x = Array.from({ length: 20 }, (_, i) => i * 2)
			.reduce((mat, m) => Matrix.concat(mat, Matrix.randn(n, 2, m, 0.1)), new Matrix(0, 2))
			.toArray()

		model.init(x)
		expect(model.centroids).toHaveLength(20)
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
})
