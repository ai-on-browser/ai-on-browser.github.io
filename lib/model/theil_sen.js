/**
 * Theil-Sen regression
 */
export default class TheilSenRegression {
	// https://oceanone.hatenablog.com/entry/2020/04/03/031040
	// https://www.fon.hum.uva.nl/praat/manual/theil_regression.html
	// https://scikit-learn.org/stable/modules/linear_model.html#theil-sen-regression
	/**
	 * @param {number} d
	 */
	constructor(d) {
		this._d = d
	}

	/**
	 * Fit model.
	 *
	 * @param {number[]} x
	 * @param {number[]} y
	 */
	fit(x, y) {
		const n = x.length

		const mid = a => {
			a.sort((a, b) => a - b)
			if (a.length % 2 === 1) {
				return a[(a.length - 1) / 2]
			} else {
				return (a[a.length / 2] + a[a.length / 2 - 1]) / 2
			}
		}

		const s = []
		for (let i = 0; i < n; i++) {
			const si = []
			for (let j = 0; j < n; j++) {
				if (i === j) {
					continue
				}
				si.push((y[j] - y[i]) / (x[j] - x[i]))
			}
			s[i] = mid(si)
		}
		this._a = mid(s)
		const b = []
		for (let i = 0; i < n; i++) {
			b[i] = y[i] - this._a * x[i]
		}
		this._b = mid(b)
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
