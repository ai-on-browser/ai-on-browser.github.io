import { Matrix } from '../util/math.js'

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
		const d = y.copySub(p)
		d.map(Math.abs)

		const w = d.sum(1)
		w.map(v => 1 / (v + 1.0e-8))
		const xtw = xh.copyMult(w)

		this._w = xtw.tDot(xh).solve(xtw.tDot(y))
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const xh = x.resize(x.rows, x.cols + 1, 1)
		return xh.dot(this._w).toArray()
	}
}
