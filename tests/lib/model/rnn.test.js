import { jest } from '@jest/globals'
jest.retryTimes(3)

import RNN from '../../../lib/model/rnn.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test.each(['rnn', 'lstm', 'gru'])('predict %s', method => {
	const model = new RNN(method, 30, 3, 1, 'adam')
	const n = 100
	const x = []
	const t = []
	for (let i = 0; i < n; i++) {
		x[i] = [Math.sin(i / 10)]
		t[i] = [Math.sin(i / 10)]
	}
	for (let i = 0; i < 100; i++) {
		model.fit(x, t, 1, 0.01, 10)
	}
	const y = model.predict(x, 100)
	const p = []
	for (let i = n; i < n + 100; i++) {
		p.push([Math.sin(i / 10)])
	}
	const err = rmse(y, p)[0]
	expect(err).toBeLessThan(0.5)
})
