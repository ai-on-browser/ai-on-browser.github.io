import { randIndex } from '../../../lib/evaluate/clustering.js'
import XMeans from '../../../lib/model/xmeans.js'
import Matrix from '../../../lib/util/matrix.js'

describe('predict', () => {
	test('default', () => {
		const model = new XMeans()
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, [2, 5], 0.1)),
			Matrix.randn(n, 2, [-2, 5], 0.1)
		).toArray()

		for (let i = 0; i < 20; i++) {
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

	test('small data', () => {
		const model = new XMeans()
		const x = [
			[0, 0],
			[0.1, 0.1],
			[-0.1, 0.1],
			[1.3, 1.4],
			[1.2, 1.4],
		]

		model.fit(x)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = [0, 0, 0, 1, 1]
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test('no iteration', () => {
		const model = new XMeans()
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, [2, 5], 0.1)).toArray()

		model.fit(x, 1)
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

test('clear', () => {
	const model = new XMeans()
	const n = 50
	const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, [2, 5], 0.1)).toArray()

	model.fit(x)
	expect(model.size).toBeGreaterThan(0)
	model.clear()
	expect(model.size).toBe(0)
})

test('predict before fit', () => {
	const model = new XMeans()
	const x = Matrix.randn(50, 2, 0, 0.1).toArray()
	expect(() => model.predict(x)).toThrow('Call fit before predict.')
})
