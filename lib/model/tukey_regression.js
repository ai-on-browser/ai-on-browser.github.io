import Matrix from '../util/matrix.js'

/**
 * Tukey regression
 */
export default class TukeyRegression {
	// https://www.smartbowwow.com/2019/05/blog-post.html
	/**
	 * @param {number} e
	 */
	constructor(e) {
		this._e = e
		this._w = null
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		const xh = Matrix.resize(x, x.rows, x.cols + 1, 1)
		y = Matrix.fromArray(y)
		if (!this._w) {
			this._w = xh.tDot(xh).solve(xh.tDot(y))
		}

		const r = xh.dot(this._w)
		r.sub(y)
		r.map(v => {
			if (Math.abs(v) <= this._e) {
				return ((1 - v ** 2) / this._e ** 2) ** 2
			}
			return 0
		})

		for (let i = 0; i < this._w.cols; i++) {
			const xhw = Matrix.mult(xh, r.col(i))
			const w = xhw.tDot(xh).solve(xhw.tDot(y.col(i)))
			this._w.set(0, i, w)
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const xh = Matrix.resize(x, x.rows, x.cols + 1, 1)
		return xh.dot(this._w).toArray()
	}
}
