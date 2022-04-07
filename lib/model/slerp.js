/**
 * Spherical linear interpolation
 */
export default class Slerp {
	// https://en.wikipedia.org/wiki/Slerp
	// http://marupeke296.com/DXG_No57_SheareLinearInterWithoutQu.html
	/**
	 * @param {number} [o=1] Angle subtended by the arc
	 */
	constructor(o = 1) {
		this._o = o
		this._sino = Math.sin(this._o)
	}

	/**
	 * Fit model.
	 *
	 * @param {number[]} x Training data
	 * @param {number[]} y Target values
	 */
	fit(x, y) {
		const d = x.map((v, i) => [v, y[i]])
		d.sort((a, b) => a[0] - b[0])
		this._x = d.map(v => v[0])
		this._y = d.map(v => v[1])
	}

	/**
	 * Returns predicted interpolated values.
	 *
	 * @param {number[]} target Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(target) {
		const n = this._x.length
		return target.map(t => {
			if (t <= this._x[0]) {
				return this._y[0]
			} else if (t >= this._x[n - 1]) {
				return this._y[n - 1]
			}
			for (let i = 1; i < n; i++) {
				if (t <= this._x[i]) {
					const p = (t - this._x[i - 1]) / (this._x[i] - this._x[i - 1])
					if (this._o === 0) {
						return (1 - p) * this._y[i - 1] + p * this._y[i]
					}
					return (
						(Math.sin((1 - p) * this._o) * this._y[i - 1] + Math.sin(p * this._o) * this._y[i]) / this._sino
					)
				}
			}
			return this._y[n - 1]
		})
	}
}
