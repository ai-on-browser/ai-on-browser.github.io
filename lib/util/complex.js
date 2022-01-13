/**
 * Complex number
 */
export default class Complex {
	/**
	 * @param {number} [real=0]
	 * @param {number} [imag=0]
	 */
	constructor(real = 0, imag = 0) {
		this._real = real
		this._imaginary = imag
	}

	/**
	 * Real value.
	 * @type {number}
	 */
	get real() {
		return this._real
	}

	/**
	 * Imaginary value.
	 * @type {number}
	 */
	get imaginary() {
		return this._imaginary
	}

	/**
	 * Returns absolute value.
	 * @returns {number}
	 */
	abs() {
		return Math.sqrt(this._real ** 2 + this._imaginary ** 2)
	}

	/**
	 * Returns conjugate value.
	 * @returns {Complex}
	 */
	conjugate() {
		return new Complex(this._real, -this._imaginary)
	}

	/**
	 * Returns added value.
	 * @param {number | Complex} other
	 * @returns {Complex}
	 */
	add(other) {
		if (typeof other === 'number') {
			return new Complex(this._real + other, this._imaginary)
		}
		return new Complex(this._real + other._real, this._imaginary + other._imaginary)
	}

	/**
	 * Returns subtracted value.
	 * @param {number | Complex} other
	 * @returns {Complex}
	 */
	sub(other) {
		if (typeof other === 'number') {
			return new Complex(this._real - other, this._imaginary)
		}
		return new Complex(this._real - other._real, this._imaginary - other._imaginary)
	}

	/**
	 * Returns multiplicated value.
	 * @param {number | Complex} other
	 * @returns {Complex}
	 */
	mult(other) {
		if (typeof other === 'number') {
			return new Complex(this._real * other, this._imaginary * other)
		}
		return new Complex(
			this._real * other._real - this._imaginary * other._imaginary,
			this._imaginary * other._real + this._real * other._imaginary
		)
	}

	/**
	 * Returns divided value.
	 * @param {number | Complex} other
	 * @returns {Complex}
	 */
	div(other) {
		if (typeof other === 'number') {
			return new Complex(this._real / other, this._imaginary / other)
		}
		const d = other._real ** 2 + other._imaginary ** 2
		return new Complex(
			(this._real * other._real + this._imaginary * other._imaginary) / d,
			(this._imaginary * other._real - this._real * other._imaginary) / d
		)
	}

	/**
	 * Returns sqare root values.
	 * @param {number | Complex} other
	 * @returns {[Complex, Complex]}
	 */
	sqrt() {
		const th = Math.atan2(this._imaginary, this._real) / 2
		const s = Math.sqrt(this.abs())
		const c = []
		for (let k = 0; k < 2; k++) {
			const r = Math.cos(th + k * Math.PI)
			const i = Math.sin(th + k * Math.PI)
			c.push(new Complex(r * s, i * s))
		}
		return c
	}

	/**
	 * Returns cubic root values.
	 * @param {number | Complex} other
	 * @returns {[Complex, Complex, Complex]}
	 */
	cbrt() {
		const th = Math.atan2(this._imaginary, this._real) / 3
		const s = Math.cbrt(this.abs())
		const c = []
		for (let k = 0; k < 3; k++) {
			const r = Math.cos(th + (k * Math.PI * 2) / 3)
			const i = Math.sin(th + (k * Math.PI * 2) / 3)
			c.push(new Complex(r * s, i * s))
		}
		return c
	}
}
