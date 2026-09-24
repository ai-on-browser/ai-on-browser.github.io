/**
 * Nadaraya–Watson kernel regression
 */
export default class NadarayaWatson {
	// https://www.slideshare.net/yukaraikemiya/6-15415589
	/**
	 * @param {number} [s] Sigmas of normal distribution
	 */
	constructor(s) {
		this._s = s
		this._p = x => {
			const de = Math.sqrt(2 * Math.PI * this._s) ** x.length
			const s = x.reduce((s, v) => s + v ** 2, 0)
			return Math.exp(-s / this._s) / de
		}
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	fit(x, y) {
		this._y = y

		if (!this._s) {
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

			const h = (1.06 * sgm) / n ** 0.2
			this._s = h ** 2
		}
		this._x = x
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		const n = this._x.length
		return x.map(v => {
			let s = 0
			let den = 0
			for (let i = 0; i < n; i++) {
				const p = this._p(v.map((vi, j) => this._x[i][j] - vi))
				s += this._y[i][0] * p
				den += p
			}
			return s / den
		})
	}
}
