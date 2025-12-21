import { accuracy } from '../../../lib/evaluate/classification.js'
import { MultinomialProbit, Probit } from '../../../lib/model/probit.js'
import Matrix from '../../../lib/util/matrix.js'

describe('probit', () => {
	test('fit', { retry: 5 }, () => {
		const model = new Probit()
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		model.init(x, t)
		for (let i = 0; i < 200; i++) {
			model.fit()
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})
})

describe('multinomial', () => {
	test('fit', { retry: 5 }, () => {
		const model = new MultinomialProbit()
		const n = 20
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})
})
