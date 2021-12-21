import { Matrix } from '../../../lib/util/math.js'
import { LogisticRegression, MultinomialLogisticRegression } from '../../../lib/model/logistic.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe('logistic', () => {
	test('default', () => {
		const model = new LogisticRegression()
	})

	test('fit', () => {
		const model = new LogisticRegression()
		const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		for (let i = 0; i < 1000; i++) {
			model.fit(x, t, 1, 0.01)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.9)
	})
})

describe('multinomial', () => {
	test('default', () => {
		const model = new MultinomialLogisticRegression()
	})

	test('fit', () => {
		const model = new MultinomialLogisticRegression()
		const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})
})
