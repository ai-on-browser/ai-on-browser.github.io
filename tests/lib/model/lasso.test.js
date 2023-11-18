import Matrix from '../../../lib/util/matrix.js'
import Lasso from '../../../lib/model/lasso.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('default', () => {
	const model = new Lasso()
	expect(model._lambda).toBe(0.1)
})

test.each([undefined, 'CD', 'ISTA'])('fit %s', method => {
	const model = new Lasso(0.01, method)
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	for (let i = 0; i < 100; i++) {
		model.fit(x, t)
	}
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})

test('fit LARS', () => {
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}

	let min_err = Infinity
	for (let i = -8; i <= 8; i += 0.01) {
		const model = new Lasso(10 ** i, 'LARS')
		model.fit(x, t)
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		min_err = Math.min(err, min_err)
	}
	expect(min_err).toBeLessThan(0.5)
})

test('importance', () => {
	const model = new Lasso()
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	for (let i = 0; i < 100; i++) {
		model.fit(x, t)
	}
	const importance = model.importance()
	expect(importance).toHaveLength(2)
})
