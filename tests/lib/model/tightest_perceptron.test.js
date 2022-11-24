import { jest } from '@jest/globals'
jest.retryTimes(5)

import Matrix from '../../../lib/util/matrix.js'
import TightestPerceptron from '../../../lib/model/tightest_perceptron.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe('classification', () => {
	describe.each([undefined, 'zero_one', 'hinge'])('accuracyLoss %s', accuracyLoss => {
		test.each([undefined, 'gaussian'])('kernel %s', kernel => {
			const model = new TightestPerceptron(10, kernel)
			const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
			x[50] = [0.1, 0.1]
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

		test.each(['polynomial'])('kernel %s', kernel => {
			const model = new TightestPerceptron(10, kernel)
			const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
			x[50] = [0.1, 0.1]
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
			const model = new TightestPerceptron(10, (a, b) =>
				Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / 0.01)
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
