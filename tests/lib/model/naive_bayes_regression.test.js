import { rmse } from '../../../lib/evaluate/regression.js'
import NaiveBayesRegression from '../../../lib/model/naive_bayes_regression.js'

describe('predict', () => {
	test('fit', () => {
		const iscat = [true, false, true, false, true]
		const model = new NaiveBayesRegression(iscat)
		const n = 50
		const x = []
		const t = []
		for (let i = 0; i < n; i++) {
			const xi = []
			for (let k = 0; k < 5; k++) {
				if (iscat[k]) {
					const r = Math.floor(Math.random() * 10)
					xi[k] = String.fromCharCode('a'.charCodeAt(0) + r)
				} else {
					xi[k] = Math.random() * 2
				}
			}
			x.push(xi)
			t.push(0)
		}
		for (let i = 0; i < n; i++) {
			const xi = []
			for (let k = 0; k < 5; k++) {
				if (iscat[k]) {
					const r = Math.floor(Math.random() * 10 + 9)
					xi[k] = String.fromCharCode('a'.charCodeAt(0) + r)
				} else {
					xi[k] = Math.random() * 2 + 2
				}
			}
			x.push(xi)
			t.push(1)
		}

		model.fit(x, t)

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		const err = rmse(y, t)
		expect(err).toBeLessThan(0.5)
	})
})
