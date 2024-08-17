import Matrix from '../../../lib/util/matrix.js'
import DIANA from '../../../lib/model/diana.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('clustering', () => {
	test('2 clusters', () => {
		const model = new DIANA()
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

		model.init(x)
		model.fit()
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

	test('4 clusters', () => {
		const model = new DIANA()
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.concat(Matrix.randn(n, 2, 10, 0.1), Matrix.randn(n, 2, 15, 0.1))
		).toArray()

		model.init(x)
		model.fit()
		model.fit()
		expect(model.size).toBe(4)
		const y = model.predict()
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test('single cluster', () => {
		const model = new DIANA()
		const x = [[0, 0]]

		model.init(x)
		model.fit()
		expect(model.size).toBe(1)
		const y = model.predict()
		expect(y).toHaveLength(x.length)
		expect(y[0]).toBe(0)
	})
})
