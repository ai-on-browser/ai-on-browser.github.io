import { jest } from '@jest/globals'
jest.retryTimes(10)

import Matrix from '../../../lib/util/matrix.js'
import Forgetron from '../../../lib/model/forgetron.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe('classification', () => {
	test.each([undefined, 'gaussian', { name: 'gaussian', s: 0.8 }])('kernel %s', kernel => {
		const model = new Forgetron(10, kernel)
		const s = 2
		const x = []
		for (let i = 0; i < 50; i++) {
			const r = (i / 50) * Math.PI
			x.push([Math.cos(r) * s + Math.random() - 0.5, Math.sin(r) * s + Math.random() - 0.5])
		}
		for (let i = 0; i < 50; i++) {
			const r = (i / 50) * Math.PI
			x.push([s - Math.cos(r) * s + Math.random() - 0.5, s - Math.sin(r) * s - s / 2 + Math.random() - 0.5])
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

	test.each(['polynomial', { name: 'polynomial', d: 3 }])('kernel %s', kernel => {
		const model = new Forgetron(100, kernel)
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		for (let i = 0; i < 10; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.9)
	})

	test('custom kernel', () => {
		const model = new Forgetron(10, (a, b) =>
			Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / 0.01)
		)
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
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
})
