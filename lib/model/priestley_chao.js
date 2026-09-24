/**
 * Priestley–Chao kernel estimator
 */
export default class PriestleyChao {
	// https://en.wikipedia.org/wiki/Kernel_regression
	// http://www.ma.man.ac.uk/~peterf/MATH38011/NPR%20P-C%20Estimator.pdf
	/**
	 * @param {number} h Smoothing parameter for the kernel
	 */
	constructor(h) {
		this._h = h
		this._p = x => {
			const de = Math.sqrt(2 * Math.PI)
			return x.map(v => Math.exp(-(v ** 2) / 2) / de)
		}
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	fit(x, y) {
		if (!this._h) {
			// Silverman's method
			const n = x.length
			const k = x.map(d => Math.sqrt(d.reduce((s, v) => s + v ** 2, 0)))
			const mean = k.reduce((s, v) => s + v, 0) / n
			const std = Math.sqrt(k.reduce((s, v) => s + (v - mean) ** 2, 0) / n)
			k.sort((a, b) => a - b)
			const q = p => {
				const np = (n - 1) * p
				const np_l = Math.floor(np)
				const np_h = Math.ceil(np)
				return k[np_l] + (np - np_l) * (k[np_h] - k[np_l])
			}
			const sgm = Math.min(std, (q(0.75) - q(0.25)) / 1.34)

			this._h = (1.06 * sgm) / n ** 0.2
		}
		const d = x.map((v, i) => [v[0], y[i]])
		d.sort((a, b) => a[0] - b[0])
		this._x = d.map(v => v[0])
		this._x2 = this._x.slice(1)
		this._xd = this._x2.map((v, i) => v - this._x[i])
		this._y = d.map(v => v[1])
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		const n = this._x2.length
		return x.map(v => {
			const d = this._x2.map(a => (a - v[0]) / this._h)
			const p = this._p(d)

			let s = 0
			for (let i = 0; i < n; i++) {
				s += this._y[i][0] * p[i] * this._xd[i]
			}
			return s / this._h
		})
	}
}
