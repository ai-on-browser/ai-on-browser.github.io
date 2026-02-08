import { randIndex } from '../../../lib/evaluate/clustering.js'
import BlurringMeanShift from '../../../lib/model/bms.js'
import Matrix from '../../../lib/util/matrix.js'

describe('density estimation', () => {
	test.each([
		undefined,
		'gaussian',
		{ name: 'gaussian' },
		'triangular',
		{ name: 'triangular' },
		'epanechnikov',
		{ name: 'epanechnikov' },
		'biweight',
		{ name: 'biweight' },
		'triweight',
		{ name: 'triweight' },
	])('kernel %s', { retry: 3 }, kernel => {
		const model = new BlurringMeanShift(1.0, 0.01, kernel)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		model.init(x)
		for (let i = 0; i < 10; i++) {
			model.fit()
		}
		const y = model.predict()
		expect(y).toHaveLength(x.length)
		expect(model.size).toBe(3)
		expect(model.categories).toHaveLength(3)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test.each(['rectangular', { name: 'rectangular' }])('kernel %s', kernel => {
		const model = new BlurringMeanShift(1.0, 0.01, kernel)
		const n = 50
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)),
			Matrix.randn(n, 2, [0, 5], 0.1)
		).toArray()

		model.init(x)
		for (let i = 0; i < 10; i++) {
			model.fit()
		}
		const y = model.predict()
		expect(y).toHaveLength(x.length)
		expect(model.size).toBe(3)
		expect(model.categories).toHaveLength(3)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test('custom kernel', { retry: 3 }, () => {
		const model = new BlurringMeanShift(0.4, 0.01, v => 1 / (v + 1.0))
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

		model.init(x)
		for (let i = 0; i < 10; i++) {
			model.fit()
		}
		const y = model.predict()
		expect(y).toHaveLength(x.length)
		expect(model.size).toBe(2)
		expect(model.categories).toHaveLength(2)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})
})
