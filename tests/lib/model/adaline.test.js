import Matrix from '../../../lib/util/matrix.js'
import ADALINE from '../../../lib/model/adaline.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('default', () => {
	const model = new ADALINE(0.1)
	expect(model._r).toBe(0.1)
})

test('fit', () => {
	const model = new ADALINE(0.01)
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [Math.floor(i / 50) * 2 - 1]
	}
	for (let i = 0; i < 1000; i++) {
		model.fit(x, t)
	}
	const y = model.predict(x)
	const acc = accuracy(
		y,
		t.map(v => v[0])
	)
	expect(acc).toBeGreaterThan(0.95)
})
