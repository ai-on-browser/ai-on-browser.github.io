import Matrix from '../util/matrix.js'

/**
 * Least trimmed squares
 */
export default class LeastTrimmedSquaresRegression {
	// http://sfb649.wiwi.hu-berlin.de/fedc_homepage/xplore/tutorials/xaghtmlnode12.html
	/**
	 * @param {number} [h=0.9] Sampling rate
	 */
	constructor(h = 0.9) {
		this._w = null
		this._h = h
	}

	_ls(x, y) {
		const xtx = x.tDot(x)
		return xtx.solve(x.tDot(y))
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const xh = Matrix.resize(x, x.rows, x.cols + 1, 1)

		const wls = this._ls(xh, y)
		const yls = xh.dot(wls)
		yls.sub(y)
		yls.mult(yls)

		const r = yls.sum(1).value.map((v, i) => [v, i])
		r.sort((a, b) => a[0] - b[0])

		const h = Math.max(1, Math.floor(r.length * this._h))

		const xlts = xh.row(r.slice(0, h).map(v => v[1]))
		const ylts = y.row(r.slice(0, h).map(v => v[1]))

		this._w = this._ls(xlts, ylts)
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const xh = Matrix.resize(x, x.rows, x.cols + 1, 1)
		return xh.dot(this._w).toArray()
	}
}
