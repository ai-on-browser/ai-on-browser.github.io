import { accuracy } from '../../../lib/evaluate/classification.js'
import AROW from '../../../lib/model/arow.js'
import Matrix from '../../../lib/util/matrix.js'

test('default', () => {
	const model = new AROW()
	expect(model._r).toBe(0.1)
})

test('fit', () => {
	const model = new AROW(0.01)
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / 50) * 2 - 1
	}
	model.init(x, t)
	for (let i = 0; i < 100; i++) {
		model.fit()
	}
	const y = model.predict(x)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
