import { jest } from '@jest/globals'
jest.retryTimes(10)

import Matrix from '../../../lib/util/matrix.js'
import BSGD from '../../../lib/model/bsgd.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe('classification', () => {
	describe.each([undefined, 'removal', 'projection', 'merging'])('maintenance %s', maintenance => {
		test.each([undefined, 'gaussian'])('kernel %s', kernel => {
			const model = new BSGD(10, 1, 0.01, maintenance, kernel)
			const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
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
			expect(acc).toBeGreaterThan(0.9)
		})

		test('kernel polynomial', () => {
			const model = new BSGD(10, 1, 0.01, maintenance, 'polynomial')
			const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
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
			model.init(x, t)
			for (let i = 0; i < 10; i++) {
				model.fit()
			}
			const y = model.predict(x)
			const acc = accuracy(y, t)
			expect(acc).toBeGreaterThan(0.9)
		})
	})
})
