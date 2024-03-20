import { jest } from '@jest/globals'
jest.retryTimes(10)

import Matrix from '../../../lib/util/matrix.js'
import BSGD, { MulticlassBSGD } from '../../../lib/model/bsgd.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe('classification', () => {
	test('default', () => {
		const model = new BSGD()
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

	describe.each([undefined, 'removal', 'projection', 'merging'])('maintenance %s', maintenance => {
		test.each([undefined, 'gaussian', { name: 'gaussian', s: 0.8 }])('kernel %s', kernel => {
			const model = new BSGD(10, 1, 0.01, maintenance, kernel)
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

		test.each(['polynomial', { name: 'polynomial', d: 3 }])('kernel %s', kernel => {
			const model = new BSGD(10, 1, 0.01, maintenance, kernel)
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

		test('custom kernel', () => {
			const model = new BSGD(10, 1, 0.01, maintenance, (a, b) =>
				Math.exp(-2 * a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2)
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
	})
})

describe('multiclass classification', () => {
	test('default', () => {
		const model = new MulticlassBSGD()
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
		}
		for (let i = 0; i < 10; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThanOrEqual(0.5)
	})

	describe.each([undefined, 'removal', 'projection', 'merging'])('maintenance %s', maintenance => {
		test.each([undefined, 'gaussian', { name: 'gaussian', s: 0.8 }])('kernel %s', kernel => {
			const model = new MulticlassBSGD(10, 1, 0.01, maintenance, kernel)
			const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
			const t = []
			for (let i = 0; i < x.length; i++) {
				t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
			}
			for (let i = 0; i < 10; i++) {
				model.fit(x, t)
			}
			const y = model.predict(x)
			const acc = accuracy(y, t)
			expect(acc).toBeGreaterThan(0.9)
		})

		test.each(['polynomial', { name: 'polynomial', d: 3 }])('kernel %s', kernel => {
			const model = new MulticlassBSGD(10, 1, 0.01, maintenance, kernel)
			const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
			const t = []
			for (let i = 0; i < x.length; i++) {
				t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
			}
			for (let i = 0; i < 10; i++) {
				model.fit(x, t)
			}
			const y = model.predict(x)
			const acc = accuracy(y, t)
			expect(acc).toBeGreaterThan(0.7)
		})

		test('custom kernel', () => {
			const model = new MulticlassBSGD(10, 1, 0.01, maintenance, (a, b) =>
				Math.exp(-2 * a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2)
			)
			const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
			const t = []
			for (let i = 0; i < x.length; i++) {
				t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
			}
			for (let i = 0; i < 10; i++) {
				model.fit(x, t)
			}
			const y = model.predict(x)
			const acc = accuracy(y, t)
			expect(acc).toBeGreaterThan(0.9)
		})
	})
})
