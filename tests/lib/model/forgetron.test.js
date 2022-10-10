import { jest } from '@jest/globals'
jest.retryTimes(5)

import Forgetron from '../../../lib/model/forgetron.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test.each([undefined, 'gaussian'])('fit %s', kernel => {
	const model = new Forgetron(10, kernel)
	const s = 2
	const x = []
	for (let i = 0; i < 50; i++) {
		const r = i / 50 * Math.PI
		x.push([Math.cos(r) * s + Math.random() - 0.5, Math.sin(r) * s + Math.random() - 0.5])
	}
	for (let i = 0; i < 50; i++) {
		const r = i / 50 * Math.PI
		x.push([s - Math.cos(r) * s + Math.random() - 0.5, s - Math.sin(r) * s - s / 2 + Math.random() - 0.5])
	}
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / 50) * 2 - 1
	}
	model.init(x, t)
	for (let i = 0; i < 10; i++) {
		model.fit()
	}
	const y = model.predict(x)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
