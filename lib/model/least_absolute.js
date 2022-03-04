import Matrix from '../util/matrix.js'

/**
 * Least absolute deviations
 */
export default class LeastAbsolute {
	// http://article.sapub.org/10.5923.j.statistics.20150503.02.html
	constructor() {
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
		y = Matrix.fromArray(y)
		const n = x.rows
		const xh = x.resize(n, x.cols + 1, 1)

		if (this._w === null) {
			this._w = Matrix.randn(xh.cols, y.cols)
		}

		const p = xh.dot(this._w)
		const d = Matrix.sub(y, p)
		d.map(v => 1 / (Math.abs(v) + 1.0e-8))

		for (let i = 0; i < this._w.cols; i++) {
			const xtw = Matrix.mult(xh, d.col(i))
			const w = xtw.tDot(xh).solve(xtw.tDot(y.col(i)))
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
		const xh = x.resize(x.rows, x.cols + 1, 1)
		return xh.dot(this._w).toArray()
	}
}
