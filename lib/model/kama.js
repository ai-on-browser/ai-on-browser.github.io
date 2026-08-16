/**
 * Kaufman's Adaptive Moving Average
 */
export default class KAMA {
	// http://exceltechnical.web.fc2.com/lsqma.html
	// https://note.com/toyolab/n/n2e3d8c0fae6f
	// https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/kaufmans-adaptive-moving-average-kama
	/**
	 * @param {number} n Number of periods for the Efficiency Ratio
	 * @param {number} k1 Degree of fastest weighting decrease
	 * @param {number} k2 Degree of slowest weighting decrease
	 */
	constructor(n, k1 = 2, k2 = 30) {
		this._n = n
		this._k1 = k1
		this._k2 = k2
	}

	/**
	 * Returns smoothed values.
	 * @param {number[]} data Training data
	 * @returns {number[]} Predicted values
	 */
	predict(data) {
		const as = 2 / (this._k1 + 1)
		const al = 2 / (this._k2 + 1)
		const diff = []
		for (let i = 0; i < data.length - 1; i++) {
			diff[i] = Math.abs(data[i] - data[i + 1])
		}
		const s = [data[0]]
		for (let i = 1; i < data.length; i++) {
			const n = Math.min(this._n, i)
			const signal = Math.abs(data[i] - data[i - n])
			let noise = 0
			for (let j = 0; j < n; j++) {
				noise += diff[i - j - 1]
			}
			const a = (signal / noise) * (as - al) + al
			s[i] = (1 - a) * s[i - 1] + a * data[i]
		}
		return s
	}
}
