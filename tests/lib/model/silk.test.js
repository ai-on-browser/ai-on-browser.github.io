import { accuracy } from '../../../lib/evaluate/classification.js'
import { ILK, SILK } from '../../../lib/model/silk.js'
import Matrix from '../../../lib/util/matrix.js'

describe('ilk classification', () => {
	test('default', { retry: 5 }, () => {
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
			{ name: 'gaussian', s: 0.8 },
			(a, b) => Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / 0.01),
		])('kernel %s', { retry: 5 }, kernel => {
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

		test.each(['polynomial', { name: 'polynomial', d: 3 }])('kernel %s', kernel => {
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

	test('graph', () => {
		expect(() => new ILK(1, 1, 1, undefined, 'graph')).toThrow('Not implemented.')
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
			{ name: 'gaussian', s: 0.8 },
			(a, b) => Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / 0.01),
		])('kernel %s', { retry: 5 }, kernel => {
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

		test.each(['polynomial', { name: 'polynomial', d: 3 }])('kernel %s', kernel => {
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

	test('graph', () => {
		expect(() => new SILK(1, 1, 1, 100, undefined, 'graph')).toThrow('Not implemented.')
	})
})
