import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import AffinityPropagation from '../../../lib/model/affinity_propagation.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test('predict', () => {
	const model = new AffinityPropagation()
	const n = 10
	const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

	model.init(x)
	for (let i = 0; i < 20; i++) {
		model.fit()
		expect(model.epoch).toBe(i + 1)
		if (model.categories.length <= 2) {
			break
		}
	}
	expect(model.size).toBe(2)
	const y = model.predict()
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})
