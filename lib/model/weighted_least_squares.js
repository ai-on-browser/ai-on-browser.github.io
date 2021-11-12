import { Matrix } from '../util/math.js'

/**
 * Weighted least squares
 */
export default class WeightedLeastSquares {
	// https://en.wikipedia.org/wiki/Weighted_least_squares
	// http://www.nealen.net/projects/mls/asapmls.pdf
	constructor() {}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 * @param {Array<number>} w
	 */
	fit(x, y, w) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const xh = x.resize(x.rows, x.cols + 1, 1)
		w = Matrix.fromArray(w)

		const dx = xh.copyMult(w)
		const xtx = dx.tDot(xh)

		this._w = xtx.solve(dx.t).dot(y)
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
