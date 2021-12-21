import { Matrix } from '../../../lib/util/math.js'
import { Ridge, KernelRidge } from '../../../lib/model/ridge.js'

import { rmse } from '../../../lib/evaluate/regression.js'

describe('ridge', () => {
	test('default', () => {
		const model = new Ridge(0.1)
		expect(model._lambda).toBe(0.1)
	})

	test('fit', () => {
		const model = new Ridge(0.01)
		const x = Matrix.randn(50, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		model.fit(x, t)
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(0.5)
	})
})

describe('kernel ridge', () => {
	test('default', () => {
		const model = new KernelRidge(0.1, 'gaussian')
		expect(model._lambda).toBe(0.1)
	})

	test('fit', () => {
		const model = new KernelRidge(0.01, 'gaussian')
		const x = Matrix.randn(50, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		model.fit(x, t)
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(0.5)
	})
})
