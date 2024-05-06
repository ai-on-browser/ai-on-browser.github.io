/**
 * Complex number
 */
export default class Complex {
	/**
	 * @param {number} [real] Real number
	 * @param {number} [imag] Imaginary number
	 */
	constructor(real = 0, imag = 0) {
		this._real = real
		this._imag = imag
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
		return this._imag
	}

	/**
	 * Returns absolute value.
	 * @returns {number} Absolute number
	 */
	abs() {
		return Math.sqrt(this._real ** 2 + this._imag ** 2)
	}

	/**
	 * Returns conjugate value.
	 * @returns {Complex} Conjugate number
	 */
	conjugate() {
		return new Complex(this._real, -this._imag)
	}

	/**
	 * Returns added value.
	 * @param {number | Complex} other Number to add
	 * @returns {Complex} Added complex number
	 */
	add(other) {
		if (typeof other === 'number') {
			return new Complex(this._real + other, this._imag)
		}
		return new Complex(this._real + other._real, this._imag + other._imag)
	}

	/**
	 * Returns subtracted value.
	 * @param {number | Complex} other Number to subtract
	 * @returns {Complex} Subtracted complex number
	 */
	sub(other) {
		if (typeof other === 'number') {
			return new Complex(this._real - other, this._imag)
		}
		return new Complex(this._real - other._real, this._imag - other._imag)
	}

	/**
	 * Returns multiplicated value.
	 * @param {number | Complex} other Number to multiplicate
	 * @returns {Complex} Multiplicated complex number
	 */
	mult(other) {
		if (typeof other === 'number') {
			return new Complex(this._real * other, this._imag * other)
		}
		return new Complex(
			this._real * other._real - this._imag * other._imag,
			this._imag * other._real + this._real * other._imag
		)
	}

	/**
	 * Returns divided value.
	 * @param {number | Complex} other Number to divide
	 * @returns {Complex} Divided complex number
	 */
	div(other) {
		if (typeof other === 'number') {
			return new Complex(this._real / other, this._imag / other)
		}
		const d = other._real ** 2 + other._imag ** 2
		return new Complex(
			(this._real * other._real + this._imag * other._imag) / d,
			(this._imag * other._real - this._real * other._imag) / d
		)
	}

	/**
	 * Returns sqare root values.
	 * @returns {[Complex, Complex]} Sqare root complex numbers
	 */
	sqrt() {
		const th = Math.atan2(this._imag, this._real) / 2
		const s = Math.sqrt(this.abs())
		return [
			new Complex(Math.cos(th) * s, Math.sin(th) * s),
			new Complex(Math.cos(th + Math.PI) * s, Math.sin(th + Math.PI) * s),
		]
	}

	/**
	 * Returns cubic root values.
	 * @returns {[Complex, Complex, Complex]} Cubic root complex numbers
	 */
	cbrt() {
		const th = Math.atan2(this._imag, this._real) / 3
		const s = Math.cbrt(this.abs())
		return [
			new Complex(Math.cos(th) * s, Math.sin(th) * s),
			new Complex(Math.cos(th + (2 * Math.PI) / 3) * s, Math.sin(th + (2 * Math.PI) / 3) * s),
			new Complex(Math.cos(th + (4 * Math.PI) / 3) * s, Math.sin(th + (4 * Math.PI) / 3) * s),
		]
	}

	/**
	 * Returns value of complex exponential function.
	 * @returns {Complex} Exponential value
	 */
	exp() {
		const a = Math.exp(this._real)
		return new Complex(a * Math.cos(this._imag), a * Math.sin(this._imag))
	}

	/**
	 * Returns value of complex log function.
	 * @returns {Complex} Principal log value
	 */
	log() {
		return new Complex(Math.log(this.abs()), Math.atan2(this._imag, this._real))
	}
}
