/**
 * Gasser–Müller kernel estimator
 */
export default class GasserMuller {
	// https://en.wikipedia.org/wiki/Kernel_regression
	// Kernel Smoothers: An Overview of Curve Estimators for the First Graduate Course in Nonparametric Statistics
	/**
	 * @param {number} h
	 */
	constructor(h) {
		this._h = h
		this._f = (x, s0, s1) => {
			return this._cdf((x - s0) / this._h) - this._cdf((x - s1) / this._h)
		}
	}

	_cdf(x) {
		return 1 / (1 + Math.exp(-1.7 * x))
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 */
	fit(x, y) {
		const d = x.map((v, i) => [v[0], y[i]])
		d.sort((a, b) => a[0] - b[0])
		this._x = d.map(v => v[0])
		this._s = this._x.slice(1).map((v, i) => (v + this._x[i]) / 2)
		this._s.unshift(-Infinity)
		this._s.push(Infinity)
		this._y = d.map(v => v[1])
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x
	 * @returns {number[]}
	 */
	predict(x) {
		return x.map(v => {
			let m = 0
			for (let i = 0; i < this._s.length - 1; i++) {
				m += this._f(v[0], this._s[i], this._s[i + 1]) * this._y[i][0]
			}
			return m / this._h
		})
	}
}
