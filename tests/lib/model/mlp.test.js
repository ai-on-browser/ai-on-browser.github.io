import Matrix from '../../../lib/util/matrix.js'
import { MLPClassifier, MLPRegressor } from '../../../lib/model/mlp.js'

import { accuracy } from '../../../lib/evaluate/classification.js'
import { rmse } from '../../../lib/evaluate/regression.js'

test('regression', () => {
	const model = new MLPRegressor([10, 10], 'tanh', 'adam')
	const x = Matrix.randn(50, 2, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	for (let i = 0; i < 1000; i++) {
		model.fit(x, t, 1, 0.01, 10)
	}
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})

test('classifier', () => {
	const model = new MLPClassifier([10], 'tanh', 'adam')
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
	}

	for (let i = 0; i < 1000; i++) {
		model.fit(x, t, 1, 0.01, 10)
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
