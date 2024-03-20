import { jest } from '@jest/globals'
jest.retryTimes(10)

import Matrix from '../../../lib/util/matrix.js'
import Stoptron from '../../../lib/model/stoptron.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe('classification', () => {
	test('default', () => {
		const model = new Stoptron()
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

	test.each([undefined, 'gaussian', { name: 'gaussian', s: 0.8 }, 'polynomial', { name: 'polynomial', d: 3 }])(
		'kernel %s',
		kernel => {
			const model = new Stoptron(100, kernel)
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
		}
	)

	test('custom kernel', () => {
		const model = new Stoptron(100, (a, b) =>
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
		expect(acc).toBeGreaterThan(0.9)
	})

	test('many sv', () => {
		const model = new Stoptron()
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		x[50] = [0.1, 0.1]
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
})
