import { accuracy } from '../../../lib/evaluate/classification.js'
import { rmse } from '../../../lib/evaluate/regression.js'
import { XGBoost, XGBoostClassifier } from '../../../lib/model/xgboost.js'
import Matrix from '../../../lib/util/matrix.js'

describe('classifier', () => {
	test('deafult', { retry: 5 }, () => {
		const model = new XGBoostClassifier()
		const x = Matrix.randn(20, 10).toArray()
		const t = []
		for (let i = 0; i < 20; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 5))
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		expect(model.size).toBe(100)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test.each([0.5, 0])('%d', { retry: 3 }, lr => {
		const model = new XGBoostClassifier(10, 0.8, 0.1, lr)
		const x = Matrix.randn(20, 10).toArray()
		const t = []
		for (let i = 0; i < 20; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 5))
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		expect(model.size).toBe(100)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})
})

describe('regression', () => {
	test('default', { retry: 3 }, () => {
		const model = new XGBoost()
		const x = Matrix.random(20, 10, -2, 2).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		expect(model.size).toBe(100)
		const y = model.predict(x)
		const err = rmse(y, t)
		expect(err).toBeLessThan(0.5)
	})

	test.each([0.5, 0])('%d', { retry: 3 }, lr => {
		const model = new XGBoost(10, 0.8, 0.1, lr)
		const x = Matrix.random(20, 10, -2, 2).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		expect(model.size).toBe(100)
		const y = model.predict(x)
		const err = rmse(y, t)
		expect(err).toBeLessThan(0.5)
	})
})
