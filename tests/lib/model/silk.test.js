import { jest } from '@jest/globals'
jest.retryTimes(5)

import Matrix from '../../../lib/util/matrix.js'
import { ILK, SILK } from '../../../lib/model/silk.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe('ilk classification', () => {
	test('default', () => {
		const model = new ILK()
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

	describe.each([undefined, 'square', 'hinge', 'logistic'])('loss %s', loss => {
		test.each([
			undefined,
			'gaussian',
			(a, b) => Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / 0.01),
		])('kernel %s', kernel => {
			const model = new ILK(1, 1, 1, kernel, loss)
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

		test.each(['polynomial'])('kernel %s', kernel => {
			const model = new ILK(1, 0.1, 1, kernel, loss)
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
			expect(acc).toBeGreaterThan(0.7)
		})
	})
})

describe('silk classification', () => {
	test('default', () => {
		const model = new SILK()
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
		expect(acc).toBeGreaterThanOrEqual(0.5)
	})

	describe.each([undefined, 'square', 'hinge', 'logistic'])('loss %s', loss => {
		test.each([
			undefined,
			'gaussian',
			(a, b) => Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / 0.01),
		])('kernel %s', kernel => {
			const model = new SILK(1, 1, 1, 100, kernel, loss)
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

		test.each(['polynomial'])('kernel %s', kernel => {
			const model = new SILK(1, 0.1, 1, 100, kernel, loss)
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
			expect(acc).toBeGreaterThan(0.7)
		})
	})
})
