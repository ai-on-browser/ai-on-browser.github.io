import Matrix from '../../../lib/util/matrix.js'
import SVR from '../../../lib/model/svr.js'

import { rmse } from '../../../lib/evaluate/regression.js'

describe('regression', () => {
	test('kernel gaussian', { retry: 20 }, () => {
		const model = new SVR('gaussian')
		const x = Matrix.random(50, 2, -2, 2).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict(x)
		const err = rmse(
			y,
			t.map(v => v[0])
		)
		expect(err).toBeLessThan(0.9)
	})

	test.each([{ name: 'gaussian', d: 2 }, 'linear'])('kernel %s', { retry: 20 }, kernel => {
		const model = new SVR(kernel)
		const x = Matrix.random(50, 2, -2, 2).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict(x)
		const err = rmse(
			y,
			t.map(v => v[0])
		)
		expect(err).toBeLessThan(0.5)
	})

	test('custom kernel', { retry: 20 }, () => {
		const model = new SVR((a, b) => Math.exp(-2 * a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2))
		const x = Matrix.random(50, 2, -2, 2).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict(x)
		const err = rmse(
			y,
			t.map(v => v[0])
		)
		expect(err).toBeLessThan(1)
	})
})
