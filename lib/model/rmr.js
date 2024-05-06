/**
 * Repeated median regression
 */
export default class RepeatedMedianRegression {
	// https://en.wikipedia.org/wiki/Repeated_median_regression
	/**
	 * Fit model.
	 * @param {number[]} x Training data
	 * @param {number[]} y Target values
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
		const int = []
		for (let i = 0; i < n; i++) {
			const si = []
			const inti = []
			for (let j = 0; j < n; j++) {
				if (i === j) {
					continue
				}
				si.push((y[j] - y[i]) / (x[j] - x[i]))
				inti.push((x[j] * y[i] - x[i] * y[j]) / (x[j] - x[i]))
			}
			s[i] = mid(si)
			int[i] = mid(inti)
		}
		this._a = mid(s)
		this._b = mid(int)
	}

	/**
	 * Returns predicted values.
	 * @param {number[]} x Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		return x.map(v => this._a * v + this._b)
	}
}
