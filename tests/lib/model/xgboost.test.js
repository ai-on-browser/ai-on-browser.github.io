import { jest } from '@jest/globals'
jest.retryTimes(3)

import { Matrix } from '../../../lib/util/math.js'
import { XGBoost, XGBoostClassifier } from '../../../lib/model/xgboost.js'

import { accuracy } from '../../../lib/evaluate/classification.js'
import { rmse } from '../../../lib/evaluate/regression.js'

test('classifier', () => {
	const model = new XGBoostClassifier(10, 0.8, 0.1, 0.5)
	const x = Matrix.randn(20, 10).toArray()
	const t = []
	for (let i = 0; i < 20; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 5))
	}
	model.init(x, t)
	for (let i = 0; i < 100; i++) {
		model.fit()
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})

test('regression', () => {
	const model = new XGBoost(10, 0.8, 0.1, 0.5)
	const x = Matrix.random(20, 10, -2, 2).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	model.init(x, t)
	for (let i = 0; i < 100; i++) {
		model.fit()
	}
	const y = model.predict(x)
	const err = rmse(y, t)
	expect(err).toBeLessThan(0.5)
})
