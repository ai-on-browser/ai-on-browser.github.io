/**
 * Standardization
 */
export default class Standardization {
	/**
	 * @param {number} [ddof] Delta Degrees of Freedom
	 */
	constructor(ddof = 0) {
		this._ddof = ddof
	}

	/**
	 * Fit model.
	 * @param {number[] | Array<Array<number>>} x Training data
	 */
	fit(x) {
		if (Array.isArray(x[0])) {
			this._m = Array(x[0].length).fill(0)
			for (let i = 0; i < x.length; i++) {
				for (let k = 0; k < x[i].length; k++) {
					this._m[k] += x[i][k]
				}
			}
			this._m = this._m.map(v => v / x.length)
			this._s = Array(x[0].length).fill(0)
			for (let i = 0; i < x.length; i++) {
				for (let k = 0; k < x[i].length; k++) {
					this._s[k] += (x[i][k] - this._m[k]) ** 2
				}
			}
			this._s = this._s.map(v => Math.sqrt(v / (x.length - this._ddof)))
		} else {
			this._m = x.reduce((s, v) => s + v, 0) / x.length
			this._s = Math.sqrt(x.reduce((s, v) => s + (v - this._m) ** 2, 0) / (x.length - this._ddof))
		}
	}

	/**
	 * Returns transformed values.
	 * @param {number[] | Array<Array<number>>} x Sample data
	 * @returns {number[] | Array<Array<number>>} Predicted values
	 */
	predict(x) {
		return x.map(r => {
			if (Array.isArray(r)) {
				if (Array.isArray(this._m)) {
					return r.map((v, i) => (v - this._m[i]) / this._s[i])
				} else {
					return r.map(v => (v - this._m) / this._s)
				}
			}
			if (Array.isArray(this._m)) {
				return (r - this._m[0]) / this._s[0]
			} else {
				return (r - this._m) / this._s
			}
		})
	}
}
