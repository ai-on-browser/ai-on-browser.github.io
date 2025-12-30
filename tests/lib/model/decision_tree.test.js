import { accuracy } from '../../../lib/evaluate/classification.js'
import { rmse } from '../../../lib/evaluate/regression.js'
import { DecisionTreeClassifier, DecisionTreeRegression } from '../../../lib/model/decision_tree.js'
import Matrix from '../../../lib/util/matrix.js'

describe('classifier', () => {
	test('depth', () => {
		const model = new DecisionTreeClassifier()
		model.init(
			[
				[1, 1],
				[0, 0],
			],
			[1, 0]
		)
		expect(model.depth).toBe(1)
		model.fit()
		expect(model.depth).toBe(2)
	})

	test.each(['CART', 'ID3'])('method %s', method => {
		const model = new DecisionTreeClassifier(method)
		const x = Matrix.randn(20, 10).toArray()
		const t = []
		for (let i = 0; i < 20; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(Math.random() * 5))
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test.todo('importance')
})

describe('regression', () => {
	test('depth', () => {
		const model = new DecisionTreeRegression()
		model.init(
			[
				[1, 1],
				[0, 0],
			],
			[1, 0]
		)
		expect(model.depth).toBe(1)
		model.fit()
		expect(model.depth).toBe(2)
	})

	test('fit', () => {
		const model = new DecisionTreeRegression()
		const x = Matrix.randn(20, 10).toArray()
		const t = Matrix.randn(20, 1).value
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict(x)
		const err = rmse(y, t)
		expect(err).toBeLessThan(0.5)
	})

	test('fit array', () => {
		const model = new DecisionTreeRegression()
		const x = Matrix.randn(20, 10).toArray()
		const t = Matrix.randn(20, 2).toArray()
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict(x)
		const err = rmse(y, t)
		expect(err[0]).toBeLessThan(0.5)
		expect(err[1]).toBeLessThan(0.5)
	})

	test('importance', () => {
		const model = new DecisionTreeRegression()
		const x = Matrix.random(1000, 10).toArray()
		const t = x.map(v => v.reduce((s, v, i) => s + v * (i + 1), 0))

		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const importance = model.importance()
		expect(importance).toHaveLength(10)
		const lowimp = importance.slice(0, 5).reduce((s, v) => s + v, 0)
		const highimp = importance.slice(5).reduce((s, v) => s + v, 0)
		expect(lowimp).toBeLessThan(highimp)
	})
})
