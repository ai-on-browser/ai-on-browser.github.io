import Matrix from '../util/matrix.js'

/**
 * Polynomial interpolation
 */
export default class PolynomialInterpolation {
	// https://ja.wikipedia.org/wiki/%E5%A4%9A%E9%A0%85%E5%BC%8F%E8%A3%9C%E9%96%93
	constructor() {
		this._w = null
	}

	/**
	 * Fit model.
	 *
	 * @param {number[]} x
	 * @param {number[]} y
	 */
	fit(x, y) {
		const n = (this._n = x.length)
		const xh = new Matrix(n, n)
		for (let i = 0; i < n; i++) {
			let v = 1
			for (let k = 0; k < n; k++) {
				xh.set(i, k, v)
				v *= x[i]
			}
		}

		y = Matrix.fromArray(y)
		this._w = xh.solve(y)
	}

	/**
	 * Returns predicted interpolated values.
	 *
	 * @param {number[]} x
	 * @returns {number[]}
	 */
	predict(x) {
		const xh = new Matrix(x.length, this._n)
		for (let i = 0; i < x.length; i++) {
			let v = 1
			for (let k = 0; k < this._n; k++) {
				xh.set(i, k, v)
				v *= x[i]
			}
		}
		return xh.dot(this._w).value
	}
}
