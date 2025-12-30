import { accuracy } from '../../../lib/evaluate/classification.js'
import BOGD from '../../../lib/model/bogd.js'
import Matrix from '../../../lib/util/matrix.js'

describe('classification', () => {
	test('default', () => {
		const model = new BOGD()
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 2, -5, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n) * 2 - 1
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThanOrEqual(0.5)
	})

	describe.each([undefined, 'nonuniform'])('sampling %s', sampling => {
		describe.each([undefined, 'hinge'])('loss %s', loss => {
			test.each([
				undefined,
				'gaussian',
				{ name: 'gaussian', s: 0.8 },
				(a, b) => Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2)),
			])('kernel %s', { retry: 10 }, kernel => {
				const model = new BOGD(10, 0.1, 0.1, 10, sampling, kernel, loss)
				const n = 50
				const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()
				const t = []
				for (let i = 0; i < x.length; i++) {
					t[i] = Math.floor(i / n) * 2 - 1
				}
				for (let i = 0; i < 100; i++) {
					model.fit(x, t)
				}
				const y = model.predict(x)
				const acc = accuracy(y, t)
				expect(acc).toBeGreaterThan(0.8)
			})
		})
	})

	describe.each([undefined, 'uniform', 'nonuniform'])('sampling %s', sampling => {
		describe.each(['zero_one'])('loss %s', loss => {
			test.each(['polynomial', { name: 'polynomial', d: 3 }])('kernel %s', { retry: 10 }, kernel => {
				const model = new BOGD(10, 0.2, 0.2, 5, sampling, kernel, loss)
				const n = 50
				const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()
				const t = []
				for (let i = 0; i < x.length; i++) {
					t[i] = Math.floor(i / n) * 2 - 1
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
