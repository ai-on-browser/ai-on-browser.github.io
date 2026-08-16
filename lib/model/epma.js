/**
 * Endpoint moving average / Linear Regression Indicator
 */
export default class EPMA {
	// http://exceltechnical.web.fc2.com/lsqma.html
	/**
	 * @param {number} n Window size
	 */
	constructor(n) {
		this._n = n
	}

	/**
	 * Returns smoothed values.
	 * @param {number[]} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const s = []
		for (let i = 0; i < data.length; i++) {
			const n = Math.min(this._n, i + 1)
			let v = 0
			let c = 2 * n - 1
			let d = 0
			for (let j = 0; j < n; j++) {
				v += c * data[i - j]
				d += c
				c -= 3
			}
			s[i] = v / d
		}
		return s
	}
}
