import { jest } from '@jest/globals'
jest.retryTimes(5)

import Winnow from '../../../lib/model/winnow.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe.each([undefined, 1, 2])('fit version %p', version => {
	test.each([undefined, 1.1])('pos neg a: %p', alpha => {
		const model = new Winnow(alpha, null, version)
		const x = []
		const n = 50
		for (let i = 0; i < n * 2; i++) {
			const v = Array(10).fill(0)
			for (let j = 0; j < 5; j++) {
				v[j + Math.floor(i / n) * 5] = Math.random() < 0.9 ? 1 : 0
			}
			x.push(v)
		}
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		for (let i = 0; i < 10; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('neg pos', () => {
		const model = new Winnow(1.1, undefined, version)
		const x = [Array(10).fill(0)]
		const n = 50
		for (let i = 0; i < n * 2; i++) {
			const v = Array(10).fill(0)
			for (let j = 0; j < 5; j++) {
				v[j + Math.floor(i / n) * 5] = Math.random() < 0.9 ? 1 : 0
			}
			x.push(v)
		}
		const t = [-1]
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.65)
	})
})
