import Matrix from '../../../lib/util/matrix.js'
import { CELLIP, IELLIP } from '../../../lib/model/iellip.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe('CELLIP', () => {
	test('default', () => {
		const model = new CELLIP()
		expect(model._gamma).toBe(0.1)
		expect(model._a).toBe(0.5)
	})

	test('fit', () => {
		const model = new CELLIP()
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
})

describe('IELLIP', () => {
	test('default', () => {
		const model = new IELLIP()
		expect(model._b).toBe(0.9)
		expect(model._c).toBe(0.5)
	})

	test('fit', () => {
		const model = new IELLIP()
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
})
