import { rmse } from '../../../lib/evaluate/regression.js'
import LowpassFilter from '../../../lib/model/lowpass.js'

describe('smoothing', () => {
	test('dft', { retry: 3 }, () => {
		const x = []
		const t = []
		for (let i = 0; i < 100; i++) {
			x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 2
			t[i] = Math.sin(i / 20)
		}
		const model = new LowpassFilter(0.8)
		const y = model.predict(x)
		expect(y).toHaveLength(t.length)
		const err = rmse(y, t)
		expect(err).toBeLessThan(rmse(x, t))
	})

	test.each([undefined, 0.8])('fft %j', { retry: 3 }, c => {
		const x = []
		const t = []
		for (let i = 0; i < 128; i++) {
			x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 2
			t[i] = Math.sin(i / 20)
		}
		const model = new LowpassFilter(c)
		const y = model.predict(x)
		expect(y).toHaveLength(t.length)
		const err = rmse(y, t)
		expect(err).toBeLessThan(rmse(x, t))
	})
})
