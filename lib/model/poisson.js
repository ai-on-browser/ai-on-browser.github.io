import Matrix from '../util/matrix.js'

/**
 * Poisson regression
 */
export default class PoissonRegression {
	// https://en.wikipedia.org/wiki/Poisson_regression
	// https://oku.edu.mie-u.ac.jp/~okumura/stat/poisson_regression.html
	/**
	 * @param {number} rate
	 */
	constructor(rate) {
		this._w = null
		this._r = rate
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		x = x.resize(x.rows, x.cols + 1, 1)
		y = Matrix.fromArray(y)
		if (!this._w) {
			this._w = Matrix.randn(x.cols, y.cols)
		}

		const dw1 = x.tDot(y)
		const dw2 = x.dot(this._w)
		dw2.map(v => Math.exp(v))
		dw1.sub(x.tDot(dw2))
		dw1.mult(this._r / x.rows)

		this._w.add(dw1)
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		x = x.resize(x.rows, x.cols + 1, 1)
		return Matrix.map(x.dot(this._w), v => Math.exp(v)).toArray()
	}
}
