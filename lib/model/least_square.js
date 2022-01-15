import { Matrix } from '../util/math.js'

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
	 *
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)

		this._w = x.tDot(x).solve(x.tDot(y))
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		return x.dot(this._w).toArray()
	}
}
