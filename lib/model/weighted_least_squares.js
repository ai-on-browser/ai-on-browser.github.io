import Matrix from '../util/matrix.js'

/**
 * Weighted least squares
 */
export default class WeightedLeastSquares {
	// https://en.wikipedia.org/wiki/Weighted_least_squares
	// http://www.nealen.net/projects/mls/asapmls.pdf
	constructor() {}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 * @param {Array<number>} w Weight values
	 */
	fit(x, y, w) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const xh = Matrix.resize(x, x.rows, x.cols + 1, 1)
		w = Matrix.fromArray(w)

		const dx = Matrix.mult(xh, w)
		const xtx = dx.tDot(xh)

		this._w = xtx.solve(dx.t).dot(y)
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
