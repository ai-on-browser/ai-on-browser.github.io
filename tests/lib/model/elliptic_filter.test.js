import { rmse } from '../../../lib/evaluate/regression.js'
import EllipticFilter from '../../../lib/model/elliptic_filter.js'

describe('smoothing', () => {
	test('default', () => {
		const x = []
		const t = []
		for (let i = 0; i < 100; i++) {
			x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 100
			t[i] = Math.sin(i / 20)
		}
		const model = new EllipticFilter()
		const y = model.predict(x)
		expect(y).toHaveLength(t.length)
	})

	test.each([1, 30])('dft %i', n => {
		const x = []
		const t = []
		for (let i = 0; i < 100; i++) {
			x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 2
			t[i] = Math.sin(i / 20)
		}
		const model = new EllipticFilter(0.2, n, 1.1, 0.8)
		const y = model.predict(x)
		expect(y).toHaveLength(t.length)
		const err = rmse(y, t)
		expect(err).toBeLessThan(rmse(x, t))
	})

	test('fft', () => {
		const x = []
		const t = []
		for (let i = 0; i < 128; i++) {
			x[i] = Math.sin(i / 20) + (Math.random() - 0.5) / 100
			t[i] = Math.sin(i / 20)
		}
		const model = new EllipticFilter(0.2, 2, 1.1, 0.8)
		const y = model.predict(x)
		expect(y).toHaveLength(t.length)
	})
})

describe('Elliptic rational functions', () => {
	describe.each([1, 2, 3, 4, 9])('n=%i', n => {
		describe.each([1.1, 1.2, 1.5, 2, 5])('xi=%d', xi => {
			test('x=1', () => {
				const model = new EllipticFilter(0.2, n, xi, 0.8)
				expect(model._elliptic(n, xi, 1)).toBe(1)
			})

			test('x=-1', () => {
				const model = new EllipticFilter(0.2, n, xi, 0.8)
				expect(model._elliptic(n, xi, -1)).toBeCloseTo(n % 2 === 0 ? 1 : -1)
			})

			test('-1 < x < 1', () => {
				const model = new EllipticFilter(0.2, n, xi, 0.8)
				for (let i = 0; i < 100; i++) {
					const x = Math.random() * (Math.random() < 0.5 ? -1 : 1)
					expect(Math.abs(model._elliptic(n, xi, x))).toBeLessThanOrEqual(1)
				}
			})

			test('inv', () => {
				const model = new EllipticFilter(0.2, n, xi, 0.8)
				for (let i = 0; i < 100; i++) {
					const x = Math.random() * (Math.random() < 0.5 ? -10 : 10)
					const elliptic = model._elliptic(n, xi, xi / x)
					expect(elliptic).toBeCloseTo(
						model._elliptic(n, xi, xi) / model._elliptic(n, xi, x),
						5 - Math.log10(Math.abs(elliptic))
					)
				}
			})

			test('Ln', () => {
				const model = new EllipticFilter(0.2, n, xi, 0.8)
				const Ln = model._Ln(n, xi)
				expect(Ln).toBeCloseTo(model._elliptic(n, xi, xi), 5 - Math.log10(Math.abs(Ln)))
			})

			test('Ln q', () => {
				const model = new EllipticFilter(0.2, n, xi, 0.8)
				expect(model._nome(1 / model._Ln(n, xi))).toBeCloseTo(model._nome(1 / xi) ** n)
			})
		})
	})

	describe.each([5, 7])('n=%i', n => {
		describe.each([1.1, 1.2, 1.5, 2, 5])('xi=%d', xi => {
			test('x=1', () => {
				const model = new EllipticFilter(0.2, n, xi, 0.8)
				expect(model._elliptic(n, xi, 1)).toBe(1)
			})

			test('0 < x < 1', () => {
				const model = new EllipticFilter(0.2, n, xi, 0.8)
				for (let i = 0; i < 100; i++) {
					const x = Math.random()
					expect(Math.abs(model._elliptic(n, xi, x))).toBeLessThanOrEqual(1)
				}
			})

			test('inv', () => {
				const model = new EllipticFilter(0.2, n, xi, 0.8)
				for (let i = 0; i < 100; i++) {
					const x = Math.random() * (Math.random() < 0.5 ? -10 : 10)
					const elliptic = model._elliptic(n, xi, xi / x)
					expect(elliptic).toBeCloseTo(
						model._elliptic(n, xi, xi) / model._elliptic(n, xi, x),
						5 - Math.log10(Math.abs(elliptic))
					)
				}
			})

			test('Ln q', () => {
				const model = new EllipticFilter(0.2, n, xi, 0.8)
				expect(model._nome(1 / model._Ln(n, xi))).toBeCloseTo(model._nome(1 / xi) ** n)
			})
		})
	})
})
