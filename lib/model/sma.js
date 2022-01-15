/**
 * Standardizes Major Axis regression
 */
export default class SMARegression {
	// https://oceanone.hatenablog.com/entry/2020/03/25/033101
	constructor() {}

	/**
	 * Fit model.
	 *
	 * @param {number[]} x
	 * @param {number[]} y
	 */
	fit(x, y) {
		const n = x.length

		const mx = x.reduce((s, v) => s + v, 0) / n
		const sx = x.reduce((s, v) => s + (v - mx) ** 2, 0) / n
		const my = y.reduce((s, v) => s + v, 0) / n
		const sy = y.reduce((s, v) => s + (v - my) ** 2, 0) / n
		const sxy = x.reduce((s, v, i) => s + (v - mx) * (y[i] - my), 0) / n

		this._a = Math.sqrt(sy / sx)
		if (sxy < 0) {
			this._a *= -1
		}

		this._b = my - this._a * mx
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {number[]} x
	 * @returns {number[]}
	 */
	predict(x) {
		return x.map(v => this._a * v + this._b)
	}
}
