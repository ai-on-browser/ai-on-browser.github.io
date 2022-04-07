/**
 * Moving median
 */
export default class MovingMedian {
	/**
	 * Returns smoothed values.
	 *
	 * @param {number[]} data Training data
	 * @param {number} n Window size
	 * @returns {number[]} Predicted values
	 */
	predict(data, n) {
		const p = []
		for (let i = 0; i < data.length; i++) {
			const m = Math.max(0, i - n + 1)
			const v = []
			for (let k = m; k <= i; k++) {
				v.push(data[k])
			}
			v.sort((a, b) => a - b)
			if (v.length % 2 === 1) {
				p[i] = v[(v.length - 1) / 2]
			} else {
				p[i] = (v[v.length / 2] + v[v.length / 2 - 1]) / 2
			}
		}
		return p
	}
}
