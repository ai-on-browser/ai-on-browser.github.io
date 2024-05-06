/**
 * Smoothstep interpolation
 */
export default class SmoothstepInterpolation {
	// https://codeplea.com/simple-interpolation
	// https://en.wikipedia.org/wiki/Smoothstep
	/**
	 * @param {number} [n] Order
	 */
	constructor(n = 1) {
		this._n = n
	}

	_c(n, k) {
		let v = 1
		for (let i = 0; i < k; i++) {
			v *= n - i
			v /= i + 1
		}
		return v
	}

	_s(t) {
		let v = 0
		for (let i = 0; i <= this._n; i++) {
			v += this._c(-this._n - 1, i) * this._c(2 * this._n + 1, this._n - i) * t ** (this._n + i + 1)
		}
		return v
	}

	/**
	 * Fit model.
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
					const m = this._s(p)
					return (1 - m) * this._y[i - 1] + m * this._y[i]
				}
			}
			return this._y[n - 1]
		})
	}
}
