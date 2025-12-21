import { randIndex } from '../../../lib/evaluate/clustering.js'
import HDBSCAN from '../../../lib/model/hdbscan.js'
import Matrix from '../../../lib/util/matrix.js'

describe('clustering', () => {
	test('default', { retry: 10 }, () => {
		const model = new HDBSCAN()
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)),
			Matrix.randn(n, 2, [0, 5], 0.2)
		).toArray()
		expect(model.size).toBe(0)

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		expect(model.size).toBeGreaterThanOrEqual(2)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.7)
	})

	test.each([undefined, 'euclid', 'manhattan', 'chebyshev'])('%s', { retry: 10 }, metric => {
		const model = new HDBSCAN(undefined, 2, metric)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)),
			Matrix.randn(n, 2, [0, 5], 0.2)
		).toArray()
		expect(model.size).toBe(0)

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		expect(model.size).toBeGreaterThanOrEqual(3)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test.each([(a, b) => a.reduce((s, v, i) => s + Math.exp((v - b[i]) ** 2) - 1, 0)])('%s', { retry: 10 }, metric => {
		const model = new HDBSCAN(undefined, 2, metric)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)),
			Matrix.randn(n, 2, [0, 5], 0.2)
		).toArray()
		expect(model.size).toBe(0)

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		expect(model.size).toBeGreaterThanOrEqual(2)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})
})
