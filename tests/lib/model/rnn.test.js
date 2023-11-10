import { jest } from '@jest/globals'
jest.retryTimes(3)

import RNN from '../../../lib/model/rnn.js'

import { rmse } from '../../../lib/evaluate/regression.js'

describe('predict', () => {
	test('default', () => {
		const model = new RNN()
		expect(model.method).toBe('lstm')
		const n = 100
		const x = []
		const t = []
		for (let i = 0; i < n; i++) {
			x[i] = [Math.sin(i / 10)]
			t[i] = [Math.sin(i / 10)]
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t, 1, 0.01, 10)
			expect(model.epoch).toBe(i + 1)
		}
		const y = model.predict(x, 100)
		const p = []
		for (let i = n; i < n + 100; i++) {
			p.push([Math.sin(i / 10)])
		}
		const err = rmse(y, p)[0]
		expect(err).toBeLessThan(1.0)
	})

	test.each([undefined, 'rnn', 'lstm', 'gru'])('%s', method => {
		const model = new RNN(method, 30, 3, 1, 'adam')
		expect(model.method).toBe(method ?? 'lstm')
		const n = 100
		const x = []
		const t = []
		for (let i = 0; i < n; i++) {
			x[i] = [Math.sin(i / 10)]
			t[i] = [Math.sin(i / 10)]
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t, 1, 0.01, 10)
			expect(model.epoch).toBe(i + 1)
		}
		const y = model.predict(x, 100)
		const p = []
		for (let i = n; i < n + 100; i++) {
			p.push([Math.sin(i / 10)])
		}
		const err = rmse(y, p)[0]
		expect(err).toBeLessThan(0.5)
	})
})
