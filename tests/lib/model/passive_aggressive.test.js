import Matrix from '../../../lib/util/matrix.js'
import PA from '../../../lib/model/passive_aggressive'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe.each([undefined, 0, 1, 2])('version %p', v => {
	test('default', () => {
		const model = new PA(v)
		expect(model._c).toBe(0.1)
	})

	test('fit', () => {
		const model = new PA(v)
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
})
