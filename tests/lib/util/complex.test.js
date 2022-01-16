import Complex from '../../../lib/util/complex.js'

describe('Complex', () => {
	describe('construcrot', () => {
		test('default', () => {
			const complex = new Complex()
			expect(complex._real).toBe(0)
			expect(complex._imag).toBe(0)
		})

		test('value', () => {
			const complex = new Complex(2, 3)
			expect(complex._real).toBe(2)
			expect(complex._imag).toBe(3)
		})
	})

	test('real', () => {
		const complex = new Complex(2, 3)
		expect(complex.real).toBe(2)
	})

	test('imaginary', () => {
		const complex = new Complex(2, 3)
		expect(complex.imaginary).toBe(3)
	})

	test('abs', () => {
		const complex = new Complex(2, 3)
		expect(complex.abs()).toBeCloseTo(Math.sqrt(13))
	})

	test('conjugate', () => {
		const org = new Complex(2, 3)
		const complex = org.conjugate()
		expect(complex.real).toBe(2)
		expect(complex.imaginary).toBe(-3)
	})

	describe('add', () => {
		test('scalar', () => {
			const a = new Complex(2, 3)
			const complex = a.add(2)
			expect(complex.real).toBe(4)
			expect(complex.imaginary).toBe(3)
		})

		test('complex', () => {
			const a = new Complex(2, 3)
			const b = new Complex(4, 5)
			const complex = a.add(b)
			expect(complex.real).toBe(6)
			expect(complex.imaginary).toBe(8)
		})
	})

	describe('sub', () => {
		test('scalar', () => {
			const a = new Complex(2, 3)
			const complex = a.sub(2)
			expect(complex.real).toBe(0)
			expect(complex.imaginary).toBe(3)
		})

		test('complex', () => {
			const a = new Complex(2, 3)
			const b = new Complex(4, 1)
			const complex = a.sub(b)
			expect(complex.real).toBe(-2)
			expect(complex.imaginary).toBe(2)
		})
	})

	describe('mult', () => {
		test('scalar', () => {
			const a = new Complex(2, 3)
			const complex = a.mult(2)
			expect(complex.real).toBe(4)
			expect(complex.imaginary).toBe(6)
		})

		test('complex', () => {
			const a = new Complex(2, 3)
			const b = new Complex(4, 5)
			const complex = a.mult(b)
			expect(complex.real).toBe(-7)
			expect(complex.imaginary).toBe(22)
		})
	})

	describe('div', () => {
		test('scalar', () => {
			const a = new Complex(2, 3)
			const complex = a.div(2)
			expect(complex.real).toBe(1)
			expect(complex.imaginary).toBe(1.5)
		})

		test('complex', () => {
			const a = new Complex(2, 3)
			const b = new Complex(4, 5)
			const complex = a.div(b)
			expect(complex.real).toBeCloseTo(23 / 41)
			expect(complex.imaginary).toBeCloseTo(2 / 41)
		})
	})

	test('sqrt', () => {
		const complex = new Complex(Math.random(), Math.random())
		const sqrt = complex.sqrt()
		expect(sqrt).toHaveLength(2)
		for (let i = 0; i < 2; i++) {
			const s = sqrt[i]
			const r = s.mult(s)
			expect(r.real).toBeCloseTo(complex.real)
			expect(r.imaginary).toBeCloseTo(complex.imaginary)
		}
	})

	test('cbrt', () => {
		const complex = new Complex(Math.random(), Math.random())
		const cbrt = complex.cbrt()
		expect(cbrt).toHaveLength(3)
		for (let i = 0; i < 3; i++) {
			const s = cbrt[i]
			const r = s.mult(s).mult(s)
			expect(r.real).toBeCloseTo(complex.real)
			expect(r.imaginary).toBeCloseTo(complex.imaginary)
		}
	})
})
