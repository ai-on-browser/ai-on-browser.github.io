import { rmse } from '../../../lib/evaluate/regression.js'
import WhittakerHendersonSmoothing from '../../../lib/model/whittaker_henderson.js'

describe('smoothing', () => {
	test('p:1', () => {
		const x = []
		const t = []
		for (let i = 0; i < 100; i++) {
			x[i] = Math.sin(i / 20) + (Math.random() - 0.5)
			t[i] = Math.sin(i / 20)
		}
		const y = new WhittakerHendersonSmoothing(100, 1).predict(x)
		expect(y).toHaveLength(t.length)
		const err = rmse(y, t)
		expect(err).toBeLessThan(rmse(x, t))
	})

	test.each([2, 3, 5])('p:%d', p => {
		const x = []
		const t = []
		for (let i = 0; i < 100; i++) {
			x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 2
			t[i] = Math.sin(i / 20)
		}
		const y = new WhittakerHendersonSmoothing(100, p).predict(x)
		expect(y).toHaveLength(t.length)
		const err = rmse(y, t)
		expect(err).toBeLessThan(rmse(x, t))
	})
})
