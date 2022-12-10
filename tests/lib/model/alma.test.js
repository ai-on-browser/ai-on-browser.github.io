import Matrix from '../../../lib/util/matrix.js'
import ALMA from '../../../lib/model/alma.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('default', () => {
	const model = new ALMA()
	expect(model._p).toBe(2)
	expect(model._alpha).toBe(1)
	expect(model._b).toBe(1)
	expect(model._c).toBe(1)
})

test('fit', () => {
	const model = new ALMA()
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / 50) * 2 - 1
	}
	for (let i = 0; i < 100; i++) {
		model.fit(x, t)
	}
	const y = model.predict(x)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
