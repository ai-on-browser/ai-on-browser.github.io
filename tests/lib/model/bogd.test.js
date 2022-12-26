import { jest } from '@jest/globals'
jest.retryTimes(10)

import Matrix from '../../../lib/util/matrix.js'
import BOGD from '../../../lib/model/bogd.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe('classification', () => {
	describe.each([undefined, 'uniform', 'nonuniform'])('sampling %s', sampling => {
		describe.each(sampling === 'uniform' ? ['zero_one'] : [undefined, 'zero_one', 'hinge'])('loss %s', loss => {
			test.each([
				undefined,
				'gaussian',
				(a, b) => Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2)),
			])('kernel %s', kernel => {
				const model = new BOGD(10, 0.5, 0.2, 0.2, sampling, kernel, loss)
				const x = Matrix.concat(Matrix.randn(50, 2, 0, 1), Matrix.randn(50, 2, 5, 1)).toArray()
				const t = []
				for (let i = 0; i < x.length; i++) {
					t[i] = Math.floor(i / 50) * 2 - 1
				}
				for (let i = 0; i < 100; i++) {
					model.fit(x, t)
				}
				const y = model.predict(x)
				const acc = accuracy(y, t)
				expect(acc).toBeGreaterThan(0.8)
			})

			test.each(['polynomial'])('kernel %s', kernel => {
				const model = new BOGD(10, 0.2, 0.2, 0.2, sampling, kernel, loss)
				const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.1), Matrix.randn(50, 2, 5, 0.1)).toArray()
				const t = []
				for (let i = 0; i < x.length; i++) {
					t[i] = Math.floor(i / 50) * 2 - 1
				}
				for (let i = 0; i < 100; i++) {
					model.fit(x, t)
				}
				const y = model.predict(x)
				const acc = accuracy(y, t)
				expect(acc).toBeGreaterThan(0.6)
			})
		})
	})
})
