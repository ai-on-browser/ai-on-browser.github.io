/**
 * Complex number
 */
export default class Complex {
	/**
	 * @param {number} [real=0] Real number
	 * @param {number} [imag=0] Imaginary number
	 */
	constructor(real = 0, imag = 0) {
		this._real = real
		this._imaginary = imag
	}

	/**
	 * Real value.
	 *
	 * @type {number}
	 */
	get real() {
		return this._real
	}

	/**
	 * Imaginary value.
	 *
	 * @type {number}
	 */
	get imaginary() {
		return this._imaginary
	}

	/**
	 * Returns absolute value.
	 *
	 * @returns {number} Absolute number
	 */
	abs() {
		return Math.sqrt(this._real ** 2 + this._imaginary ** 2)
	}

	/**
	 * Returns conjugate value.
	 *
	 * @returns {Complex} Conjugate number
	 */
	conjugate() {
		return new Complex(this._real, -this._imaginary)
	}

	/**
	 * Returns added value.
	 *
	 * @param {number | Complex} other Number to add
	 * @returns {Complex} Added complex number
	 */
	add(other) {
		if (typeof other === 'number') {
			return new Complex(this._real + other, this._imaginary)
		}
		return new Complex(this._real + other._real, this._imaginary + other._imaginary)
	}

	/**
	 * Returns subtracted value.
	 *
	 * @param {number | Complex} other Number to subtract
	 * @returns {Complex} Subtracted complex number
	 */
	sub(other) {
		if (typeof other === 'number') {
			return new Complex(this._real - other, this._imaginary)
		}
		return new Complex(this._real - other._real, this._imaginary - other._imaginary)
	}

	/**
	 * Returns multiplicated value.
	 *
	 * @param {number | Complex} other Number to multiplicate
	 * @returns {Complex} Multiplicated complex number
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
	 *
	 * @param {number | Complex} other Number to divide
	 * @returns {Complex} Divided complex number
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
	 *
	 * @returns {[Complex, Complex]} Sqare root complex numbers
	 */
	sqrt() {
		const th = Math.atan2(this._imaginary, this._real) / 2
		const s = Math.sqrt(this.abs())
		return [
			new Complex(Math.cos(th) * s, Math.sin(th) * s),
			new Complex(Math.cos(th + Math.PI) * s, Math.sin(th + Math.PI) * s),
		]
	}

	/**
	 * Returns cubic root values.
	 *
	 * @returns {[Complex, Complex, Complex]} Cubic root complex numbers
	 */
	cbrt() {
		const th = Math.atan2(this._imaginary, this._real) / 3
		const s = Math.cbrt(this.abs())
		return [
			new Complex(Math.cos(th) * s, Math.sin(th) * s),
			new Complex(Math.cos(th + (2 * Math.PI) / 3) * s, Math.sin(th + (2 * Math.PI) / 3) * s),
			new Complex(Math.cos(th + (4 * Math.PI) / 3) * s, Math.sin(th + (4 * Math.PI) / 3) * s),
		]
	}
}
