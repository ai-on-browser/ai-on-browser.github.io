import Matrix from '../../../lib/util/matrix.js'
import SecondOrderPerceptron from '../../../lib/model/sop.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe('classification', () => {
	test('default', () => {
		const model = new SecondOrderPerceptron()
		expect(model._a).toBe(1)
	})

	test('fit', () => {
		const model = new SecondOrderPerceptron(0.1)
		const n = 20
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n) * 2 - 1
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})
})
