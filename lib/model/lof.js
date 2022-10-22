/**
 * Local Outlier Factor
 */
export default class LOF {
	/**
	 * @param {number} k Number of neighborhoods
	 */
	constructor(k) {
		this._k = k
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Returns anomaly degrees.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		const distances = []
		const s_distances = []
		for (let i = 0; i < datas.length; i++) {
			distances[i] = []
			s_distances[i] = []
			distances[i][i] = 0
			s_distances[i][i] = [0, i]
			for (let j = 0; j < i; j++) {
				const d = this._distance(datas[i], datas[j])
				distances[i][j] = distances[j][i] = d
				s_distances[i][j] = [d, j]
				s_distances[j][i] = [d, i]
			}
		}
		s_distances.forEach(s => s.sort((a, b) => a[0] - b[0]))

		const lrd = []
		for (let i = 0; i < datas.length; i++) {
			const nears = s_distances[i].slice(1, 1 + this._k)
			lrd[i] =
				this._k / nears.reduce((acc, b) => acc + Math.max(s_distances[b[1]][this._k][0], distances[i][b[1]]), 0)
		}

		const lof = []
		for (let i = 0; i < datas.length; i++) {
			const nears = s_distances[i].slice(1, 1 + this._k)
			lof[i] = nears.reduce((acc, b) => acc + lrd[b[1]], 0) / this._k / lrd[i]
		}

		return lof
	}
}
