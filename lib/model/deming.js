/**
 * Deming regression
 */
export default class DemingRegression {
	// https://en.wikipedia.org/wiki/Deming_regression
	/**
	 * @param {number} d Ratio of variances
	 */
	constructor(d) {
		this._d = d
	}

	/**
	 * Fit model.
	 *
	 * @param {number[]} x Training data
	 * @param {number[]} y Target values
	 */
	fit(x, y) {
		const n = x.length

		const mx = x.reduce((s, v) => s + v, 0) / n
		const sx = x.reduce((s, v) => s + (v - mx) ** 2, 0) / (n - 1)
		const my = y.reduce((s, v) => s + v, 0) / n
		const sy = y.reduce((s, v) => s + (v - my) ** 2, 0) / (n - 1)
		const sxy = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0) / (n - 1)

		const sd = sy - this._d * sx
		this._a = (sd + Math.sqrt(sd ** 2 + 4 * this._d * sxy ** 2)) / (2 * sxy)

		this._b = my - this._a * mx
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {number[]} x Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		return x.map(v => this._a * v + this._b)
	}
}
