/**
 * Tukey's fences
 */
export default class TukeysFences {
	// https://en.wikipedia.org/wiki/Outlier#Tukey's_fences
	/**
	 * @param {number} k
	 */
	constructor(k) {
		this._k = k
	}

	/**
	 * Returns a list of the data predicted as outliers or not.
	 * @param {Array<Array<number>>} data
	 * @returns {boolean[]}
	 */
	predict(data) {
		const n = data.length
		const outliers = Array(n).fill(false)
		for (let i = 0; i < data[0].length; i++) {
			const x = data.map(v => v[i])
			x.sort((a, b) => a - b)

			const q = p => {
				const np = n * p
				const np_l = Math.floor(np)
				const np_h = Math.ceil(np)
				return x[np_l] + (np_h - np_l) * (x[np_h] - x[np_l])
			}

			const q1 = q(0.25)
			const q3 = q(0.75)

			const l = q1 - this._k * (q3 - q1)
			const h = q3 + this._k * (q3 - q1)

			for (let k = 0; k < n; k++) {
				outliers[k] ||= data[k][i] < l || h < data[k][i]
			}
		}
		return outliers
	}
}
