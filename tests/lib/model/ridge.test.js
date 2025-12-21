import { accuracy } from '../../../lib/evaluate/classification.js'
import { rmse } from '../../../lib/evaluate/regression.js'
import { KernelRidge, MulticlassRidge, Ridge } from '../../../lib/model/ridge.js'
import Matrix from '../../../lib/util/matrix.js'

describe('ridge', () => {
	test('default', () => {
		const model = new Ridge()
		expect(model._lambda).toBe(0.1)
	})

	test('fit', () => {
		const model = new Ridge(0.01)
		const x = Matrix.randn(50, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		model.fit(x, t)
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(0.5)
	})

	test('importance', () => {
		const model = new Ridge(0.01)
		const x = [
			[0, 0],
			[1, 0],
		]
		const t = [[0], [1]]
		model.fit(x, t)
		const importance = model.importance()
		expect(importance).toHaveLength(2)
		expect(importance[0]).toBeCloseTo(0.99)
		expect(importance[1]).toBeCloseTo(0)
	})
})

describe('multiclass ridge', () => {
	test('default', () => {
		const model = new MulticlassRidge()
		expect(model._lambda).toBe(0.1)
	})

	test('fit', { retry: 5 }, () => {
		const model = new MulticlassRidge(0.001)
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, [0, 5], 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
		}
		model.fit(x, t)
		const categories = model.categories.concat()
		categories.sort()
		expect(categories).toEqual(['a', 'b'])
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.75)
	})

	test('importance', () => {
		const model = new MulticlassRidge(0.01)
		const x = Matrix.concat(Matrix.randn(50, 3, 0, 0.2), Matrix.randn(50, 3, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
		}
		model.fit(x, t)
		const importance = model.importance()
		expect(importance).toHaveLength(3)
		expect(importance[0]).toHaveLength(2)
		expect(importance[1]).toHaveLength(2)
		expect(importance[2]).toHaveLength(2)
	})
})

describe('kernel ridge', () => {
	test('default', () => {
		const model = new KernelRidge()
		expect(model._lambda).toBe(0.1)
	})

	test.each([undefined, 'gaussian', { name: 'gaussian', s: 0.8 }])('fit %s', kernel => {
		const model = new KernelRidge(0.01, kernel)
		const x = Matrix.randn(50, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		model.fit(x, t)
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(0.5)
	})

	test('custom kernel', { retry: 5 }, () => {
		const model = new KernelRidge(0.01, (a, b) => Math.exp(-2 * a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2))
		const x = Matrix.randn(50, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		model.fit(x, t)
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(0.5)
	})

	test('importance', () => {
		const model = new KernelRidge(0.01, 'gaussian')
		const x = [
			[0, 0],
			[1, 0],
		]
		const t = [[0], [1]]
		model.fit(x, t)
		const importance = model.importance()
		expect(importance).toHaveLength(2)
	})
})
