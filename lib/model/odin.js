/**
 * Outlier Detection using Indegree Number
 */
export default class ODIN {
	// https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.296.9837&rep=rep1&type=pdf
	/**
	 * @param {number} [k] Number of neighborhoods
	 * @param {number} [t] Indegree threshold
	 */
	constructor(k = 5, t = 0) {
		this._k = k
		this._t = t
	}

	_d(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Returns a list of the data predicted as outliers or not.
	 *
	 * @param {Array<Array<number>>} data Training data
	 * @returns {boolean[]} Predicted values
	 */
	predict(data) {
		const n = data.length
		const dists = []
		for (let i = 0; i < n; i++) {
			dists[i] = []
			dists[i][i] = 0
			for (let j = 0; j < i; j++) {
				dists[i][j] = dists[j][i] = this._d(data[i], data[j])
			}
		}
		const indegrees = Array(n).fill(0)
		for (let i = 0; i < n; i++) {
			const d = dists[i].map((v, k) => [v, k])
			d.sort((a, b) => a[0] - b[0])
			for (let k = 1; k < Math.min(this._k + 1, d.length); k++) {
				indegrees[d[k][1]] += 1
			}
		}

		return indegrees.map(d => d <= this._t)
	}
}
