import Matrix from '../../../lib/util/matrix.js'
import { GBDT, GBDTClassifier } from '../../../lib/model/gbdt.js'

import { accuracy } from '../../../lib/evaluate/classification.js'
import { rmse } from '../../../lib/evaluate/regression.js'

describe('classifier', () => {
	test('default', { retry: 3 }, () => {
		const model = new GBDTClassifier()
		const x = Matrix.concat(Matrix.randn(10, 3, 0, 0.2), Matrix.randn(10, 3, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < 20; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 10))
		}
		model.init(x, t)
		for (let i = 0; i < 20; i++) {
			model.fit()
			expect(model.size).toBe(i + 1)
		}
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.9)
	})

	test.each([0.5, 0])('classifier %d', { retry: 3 }, lr => {
		const model = new GBDTClassifier(10, 0.8, lr)
		const x = Matrix.randn(20, 10).toArray()
		const t = []
		for (let i = 0; i < 20; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 5))
		}
		model.init(x, t)
		for (let i = 0; i < 20; i++) {
			model.fit()
			expect(model.size).toBe(i + 1)
		}
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})
})

describe('regression', () => {
	test('default', { retry: 3 }, () => {
		const model = new GBDT()
		const x = Matrix.random(20, 10, -2, 2).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		model.init(x, t)
		for (let i = 0; i < 20; i++) {
			model.fit()
		}
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(0.5)
	})

	test.each([0.5, 0])('regression %d', { retry: 3 }, lr => {
		const model = new GBDT(10, 0.8, lr)
		const x = Matrix.random(20, 10, -2, 2).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		model.init(x, t)
		for (let i = 0; i < 20; i++) {
			model.fit()
		}
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(0.5)
	})
})
