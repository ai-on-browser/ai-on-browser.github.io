import { randIndex } from '../../../lib/evaluate/clustering.js'
import CLUES from '../../../lib/model/clues.js'
import Matrix from '../../../lib/util/matrix.js'

describe('clustering', () => {
	test('default', () => {
		const model = new CLUES()
		const n = 100
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

		model.fit(x)
		const y = model.predict()
		expect(y).toHaveLength(x.length)
		expect(model.size).toBeGreaterThanOrEqual(2)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.5)
	})

	test('parameter', { retry: 5 }, () => {
		const model = new CLUES(0.4)
		const n = 100
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

		model.fit(x)
		const y = model.predict()
		expect(y).toHaveLength(x.length)
		expect(model.size).toBeGreaterThanOrEqual(2)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test('small data', { retry: 5 }, () => {
		const model = new CLUES(0.8)
		const x = Matrix.random(5, 2, -0.1, 0.1).toArray()

		model.fit(x)
		const y = model.predict()
		expect(y).toHaveLength(x.length)
		expect(model.size).toBe(1)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBe(0)
		}
	})

	test('odd knn', () => {
		const model = new CLUES()
		const x = [
			[-0.1, -0.05],
			[0.07, 0.02],
			[-0.1, 0.08],
			[0.05, 0.09],
		]

		model.fit(x)
		const y = model.predict()
		expect(y).toHaveLength(x.length)
		expect(model.size).toBe(1)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBe(0)
		}
	})

	test('min na less than T', () => {
		const model = new CLUES(0.7)
		const x = [
			[-0.14, 0.72],
			[0.13, 0.66],
			[-0.12, 0.27],
			[0.02, -0.06],
			[0.29, -0.08],
			[4.68, 4.59],
			[4.92, 5.47],
			[5.29, 4.46],
			[5.01, 5.08],
			[5.1, 5.04],
		]

		model.fit(x)
		const y = model.predict()
		expect(y).toHaveLength(x.length)
		expect(model.size).toBeGreaterThanOrEqual(2)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 5)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})
})
