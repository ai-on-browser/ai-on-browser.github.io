/**
 * Trigonometric interpolation
 */
export default class TrigonometricInterpolation {
	// https://en.wikipedia.org/wiki/Trigonometric_interpolation
	constructor() {
		this._alpha = 0
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

	_t(x, k) {
		const n = this._x.length
		let v = 1
		if (n % 2 === 0) {
			v = Math.sin((x - this._alpha) / 2) / Math.sin((this._x[k] - this._alpha) / 2)
			if (!Number.isFinite(v)) {
				v = 1
			}
		}
		for (let i = 0; i < n; i++) {
			if (i === k) continue
			v *= Math.sin((x - this._x[i]) / 2) / Math.sin((this._x[k] - this._x[i]) / 2)
		}
		return v
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
			let v = 0
			for (let i = 0; i < n; i++) {
				v += this._y[i] * this._t(t, i)
			}
			return v
		})
	}
}
