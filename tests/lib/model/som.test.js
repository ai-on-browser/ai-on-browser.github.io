import Matrix from '../../../lib/util/matrix.js'
import SOM from '../../../lib/model/som.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'
import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

describe('clustering', () => {
	test('default', { retry: 3 }, () => {
		const model = new SOM(2, 1)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		for (let i = 0; i < 100; i++) {
			model.fit(x)
		}
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		expect([...new Set(y)].length).toBeLessThanOrEqual(20)
	})

	test('init PCA', { retry: 3 }, () => {
		const model = new SOM(2, 1, 3)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		for (let i = 0; i < 100; i++) {
			model.fit(x)
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

	test('init random', { retry: 3 }, () => {
		const model = new SOM(2, 1, 3)
		model._init_method = 'random'
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		for (let i = 0; i < 100; i++) {
			model.fit(x)
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

test('dimension reduction', { retry: 3 }, () => {
	const n = 50
	const x = Matrix.concat(Matrix.randn(n, 5, 0, 0.2), Matrix.randn(n, 5, 5, 0.2)).toArray()
	const model = new SOM(5, 2, 10)
	for (let i = 0; i < 100; i++) {
		model.fit(x)
	}
	const y = model.predict(x)
	const q = coRankingMatrix(x, y, 10, 30)
	expect(q).toBeGreaterThan(0.9)
})
