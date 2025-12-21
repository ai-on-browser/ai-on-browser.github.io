import { accuracy } from '../../../lib/evaluate/classification.js'
import { rmse } from '../../../lib/evaluate/regression.js'
import { ELMClassifier, ELMRegressor } from '../../../lib/model/elm.js'
import Matrix from '../../../lib/util/matrix.js'

describe('regression', () => {
	test.each([
		undefined,
		'elu',
		'gaussian',
		'leaky_relu',
		'sigmoid',
		'softplus',
		'softsign',
		'tanh',
		x => Math.sin(x),
	])('%s', { retry: 5 }, activation => {
		const model = new ELMRegressor(20, activation)
		const x = Matrix.randn(30, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 100]
		}
		model.fit(x, t)
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(0.5)
	})
})

describe('classifier', () => {
	test.each([
		undefined,
		'elu',
		'gaussian',
		'leaky_relu',
		'sigmoid',
		'softplus',
		'softsign',
		'tanh',
		'identity',
		x => Math.sin(x),
	])('%s', { retry: 10 }, activation => {
		const model = new ELMClassifier(3, activation)
		const x = Matrix.concat(Matrix.randn(20, 2, 0, 0.2), Matrix.randn(20, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 20))
		}

		model.fit(x, t)
		expect(model.categories.toSorted()).toEqual(['a', 'b'])
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('probability', () => {
		const model = new ELMClassifier(3)
		const x = Matrix.concat(Matrix.randn(20, 2, 0, 0.2), Matrix.randn(20, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 20))
		}

		model.fit(x, t)
		const y = model.predict(x)
		const p = model.probability(x)
		const c = model.categories
		for (let i = 0; i < p.length; i++) {
			let pi = -Infinity
			let cat = null
			for (let j = 0; j < p[i].length; j++) {
				expect(p[i][j]).toBeGreaterThanOrEqual(0)
				expect(p[i][j]).toBeLessThanOrEqual(1)
				if (pi < p[i][j]) {
					pi = p[i][j]
					cat = j
				}
			}
			expect(c[cat]).toBe(y[i])
		}
	})
})
