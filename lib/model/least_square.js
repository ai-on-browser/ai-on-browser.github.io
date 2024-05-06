import Matrix from '../util/matrix.js'

/**
 * Least squares
 */
export default class LeastSquares {
	// https://ja.wikipedia.org/wiki/%E6%9C%80%E5%B0%8F%E4%BA%8C%E4%B9%97%E6%B3%95
	constructor() {
		this._w = null
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		this._shift = x.mean(0)
		x.sub(this._shift)

		this._w = x.tDot(x).solve(x.tDot(y))
		y.sub(x.dot(this._w))
		this._b = y.mean(0)
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		x.sub(this._shift)
		const p = x.dot(this._w)
		p.add(this._b)
		return p.toArray()
	}
}
