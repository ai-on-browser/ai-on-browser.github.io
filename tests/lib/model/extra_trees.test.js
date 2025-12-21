import { accuracy } from '../../../lib/evaluate/classification.js'
import { rmse } from '../../../lib/evaluate/regression.js'
import { ExtraTreesClassifier, ExtraTreesRegressor } from '../../../lib/model/extra_trees.js'
import Matrix from '../../../lib/util/matrix.js'

test('classifier', () => {
	const model = new ExtraTreesClassifier(100)
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
	}
	model.init(x, t)
	for (let i = 0; i < 100; i++) {
		model.fit()
		expect(model.depth).toBe(i + 2)
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})

test('regression', () => {
	const model = new ExtraTreesRegressor(100)
	const x = Matrix.random(50, 10, -2, 2).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = x[i][0] + x[i][1] + (Math.random() - 0.5) / 10
	}
	model.init(x, t)
	for (let i = 0; i < 100; i++) {
		model.fit()
		expect(model.depth).toBe(i + 2)
	}
	const y = model.predict(x)
	const err = rmse(y, t)
	expect(err).toBeLessThan(0.5)
})
